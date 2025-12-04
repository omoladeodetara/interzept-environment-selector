/**
 * Elo - A/B Testing Module
 * 
 * Handles variant assignment logic, experiment tracking,
 * and analytics for A/B testing experiments.
 * 
 * Storage: By default uses in-memory storage. For production, inject a
 * StorageAdapter implementation that persists to a database (PostgreSQL, Redis, etc.)
 */

import crypto from 'crypto';

// Hash range for variant assignment (0-99 = 100 buckets for percentage-based splits)
const HASH_BUCKET_SIZE = 100;

// ============================================================================
// Configuration
// ============================================================================

export interface EloConfig {
  nodeEnv: string;
  experimentDefaults: {
    controlWeight: number;
    experimentWeight: number;
  };
}

// Default configuration - can be overridden via setConfig()
let config: EloConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  experimentDefaults: {
    controlWeight: 0.5,
    experimentWeight: 0.5
  }
};

/**
 * Set the configuration for the Elo module
 * @param newConfig - Partial configuration to merge with defaults
 */
export function setConfig(newConfig: Partial<EloConfig>): void {
  config = { ...config, ...newConfig };
}

/**
 * Get the current configuration
 */
export function getConfig(): EloConfig {
  return config;
}

// ============================================================================
// Storage Abstraction Layer
// ============================================================================

export interface ExperimentMetrics {
  views: number;
  conversions: number;
  revenue: number;
}

export interface StorageAdapter {
  getAssignment(userId: string, experimentId: string): Promise<string | null>;
  setAssignment(userId: string, experimentId: string, variant: string): Promise<void>;
  getResults(experimentId: string): Promise<{ control: ExperimentMetrics; experiment: ExperimentMetrics } | null>;
  initResults(experimentId: string): Promise<void>;
  incrementViews(experimentId: string, variant: 'control' | 'experiment'): Promise<void>;
  incrementConversions(experimentId: string, variant: 'control' | 'experiment', revenue?: number): Promise<void>;
  getAllAssignments(): Promise<Array<{ userId: string; experimentId: string; variant: string }>>;
  clear(): Promise<void>;
}

/**
 * Default in-memory storage implementation
 * For production, replace with a database-backed implementation
 */
class InMemoryStorageAdapter implements StorageAdapter {
  private assignments = new Map<string, string>();
  private results = new Map<string, { control: ExperimentMetrics; experiment: ExperimentMetrics }>();

  async getAssignment(userId: string, experimentId: string): Promise<string | null> {
    const key = `${userId}:${experimentId}`;
    return this.assignments.get(key) || null;
  }

  async setAssignment(userId: string, experimentId: string, variant: string): Promise<void> {
    const key = `${userId}:${experimentId}`;
    this.assignments.set(key, variant);
  }

  async getResults(experimentId: string): Promise<{ control: ExperimentMetrics; experiment: ExperimentMetrics } | null> {
    return this.results.get(experimentId) || null;
  }

  async initResults(experimentId: string): Promise<void> {
    if (!this.results.has(experimentId)) {
      this.results.set(experimentId, {
        control: { views: 0, conversions: 0, revenue: 0 },
        experiment: { views: 0, conversions: 0, revenue: 0 }
      });
    }
  }

  async incrementViews(experimentId: string, variant: 'control' | 'experiment'): Promise<void> {
    const results = this.results.get(experimentId);
    if (results) {
      results[variant].views++;
    }
  }

  async incrementConversions(experimentId: string, variant: 'control' | 'experiment', revenue: number = 0): Promise<void> {
    const results = this.results.get(experimentId);
    if (results) {
      results[variant].conversions++;
      results[variant].revenue += revenue;
    }
  }

  async getAllAssignments(): Promise<Array<{ userId: string; experimentId: string; variant: string }>> {
    const assignments: Array<{ userId: string; experimentId: string; variant: string }> = [];
    this.assignments.forEach((variant, key) => {
      const [userId, experimentId] = key.split(':');
      assignments.push({ userId, experimentId, variant });
    });
    return assignments;
  }

  async clear(): Promise<void> {
    this.assignments.clear();
    this.results.clear();
  }
}

// Default storage instance - can be replaced via setStorageAdapter()
let storage: StorageAdapter = new InMemoryStorageAdapter();

/**
 * Set a custom storage adapter for production use
 * @param adapter - A StorageAdapter implementation (e.g., PostgreSQL, Redis)
 */
export function setStorageAdapter(adapter: StorageAdapter): void {
  storage = adapter;
}

/**
 * Get the current storage adapter (useful for testing)
 */
export function getStorageAdapter(): StorageAdapter {
  return storage;
}

/**
 * Assign a user to a variant for a specific experiment
 * Uses consistent random assignment based on user ID
 * 
 * @param userId - The user identifier
 * @param experimentId - The experiment identifier
 * @param weights - Optional weights for variants (default: 50/50 split)
 * @returns The assigned variant ('control' or 'experiment')
 */
export async function assignVariant(
  userId: string,
  experimentId: string,
  weights: { controlWeight: number; experimentWeight: number } | null = null
): Promise<string> {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!experimentId || typeof experimentId !== 'string') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  // Check if user already has an assignment for this experiment
  const existingAssignment = await storage.getAssignment(userId, experimentId);
  if (existingAssignment) {
    return existingAssignment;
  }
  
  // Use default weights if not provided
  const assignmentWeights = weights || config.experimentDefaults;
  
  // Deterministic random assignment based on user ID and experiment ID
  // This ensures the same user always gets the same variant for an experiment
  const hash = hashString(`${userId}:${experimentId}`);
  const randomValue = hash / HASH_BUCKET_SIZE; // Value between 0 and 1
  
  const variant = randomValue < assignmentWeights.controlWeight ? 'control' : 'experiment';
  
  // Store the assignment
  await storage.setAssignment(userId, experimentId, variant);
  
  // Initialize experiment results if not exists
  await storage.initResults(experimentId);
  
  // Increment view count
  await storage.incrementViews(experimentId, variant as 'control' | 'experiment');
  
  if (config.nodeEnv === 'development') {
    console.log(`[Elo] Assigned user ${userId} to variant "${variant}" for experiment ${experimentId}`);
  }
  
  return variant;
}

/**
 * Robust hash function for deterministic random assignment
 * Uses crypto module to ensure better distribution for A/B testing
 * 
 * @param str - The string to hash
 * @returns A hash value between 0 and (HASH_BUCKET_SIZE - 1)
 */
function hashString(str: string): number {
  // Use SHA-256 for deterministic hashing with good distribution; security is not required here
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  // Take first 8 characters and convert to integer
  const hashInt = parseInt(hash.substring(0, 8), 16);
  // Return value between 0 and (HASH_BUCKET_SIZE - 1)
  return hashInt % HASH_BUCKET_SIZE;
}

/**
 * Get the variant assignment for a user in an experiment
 * 
 * @param userId - The user identifier
 * @param experimentId - The experiment identifier
 * @returns The assigned variant or null if not assigned
 */
export async function getExperimentVariant(userId: string, experimentId: string): Promise<string | null> {
  return storage.getAssignment(userId, experimentId);
}

/**
 * Track a conversion for an experiment
 * 
 * @param userId - The user identifier
 * @param experimentId - The experiment identifier
 * @param conversionData - Additional conversion data
 * @returns Updated experiment results
 */
export async function trackConversion(
  userId: string,
  experimentId: string,
  conversionData: { revenue?: number; timestamp?: Date; [key: string]: unknown } = {}
): Promise<{ control: ExperimentMetrics; experiment: ExperimentMetrics } | null> {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!experimentId || typeof experimentId !== 'string') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  // Get the user's variant
  const variant = await getExperimentVariant(userId, experimentId);
  
  if (!variant) {
    throw new Error(`No variant assignment found for user ${userId} in experiment ${experimentId}`);
  }
  
  // Get experiment results
  const results = await storage.getResults(experimentId);
  
  if (!results) {
    throw new Error(`No results found for experiment ${experimentId}`);
  }
  
  // Update conversion metrics
  await storage.incrementConversions(experimentId, variant as 'control' | 'experiment', conversionData.revenue);
  
  if (config.nodeEnv === 'development') {
    console.log(`[Elo] Tracked conversion for user ${userId} in variant "${variant}" for experiment ${experimentId}`);
    console.log(`[Elo] Revenue: ${conversionData.revenue || 0}`);
  }
  
  return storage.getResults(experimentId);
}

/**
 * Get experiment results and statistics
 * 
 * @param experimentId - The experiment identifier
 * @returns Experiment results with statistics
 */
export async function getExperimentResults(experimentId: string): Promise<any> {
  const results = await storage.getResults(experimentId);
  
  if (!results) {
    return {
      experimentId,
      status: 'not_found',
      message: 'No data available for this experiment'
    };
  }
  
  // Calculate conversion rates (keep as numbers for accurate calculations)
  const controlConversionRate = results.control.views > 0 
    ? (results.control.conversions / results.control.views * 100)
    : 0;
    
  const experimentConversionRate = results.experiment.views > 0
    ? (results.experiment.conversions / results.experiment.views * 100)
    : 0;
  
  // Calculate average revenue per user (keep as numbers for accurate calculations)
  const controlARPU = results.control.conversions > 0
    ? (results.control.revenue / results.control.conversions)
    : 0;
    
  const experimentARPU = results.experiment.conversions > 0
    ? (results.experiment.revenue / results.experiment.conversions)
    : 0;
  
  return {
    experimentId,
    control: {
      views: results.control.views,
      conversions: results.control.conversions,
      revenue: results.control.revenue.toFixed(2),
      conversionRate: `${controlConversionRate.toFixed(2)}%`,
      arpu: controlARPU.toFixed(2)
    },
    experiment: {
      views: results.experiment.views,
      conversions: results.experiment.conversions,
      revenue: results.experiment.revenue.toFixed(2),
      conversionRate: `${experimentConversionRate.toFixed(2)}%`,
      arpu: experimentARPU.toFixed(2)
    },
    summary: {
      totalViews: results.control.views + results.experiment.views,
      totalConversions: results.control.conversions + results.experiment.conversions,
      totalRevenue: (results.control.revenue + results.experiment.revenue).toFixed(2),
      conversionRateDiff: `${(experimentConversionRate - controlConversionRate).toFixed(2)}%`,
      revenuePerUserDiff: (experimentARPU - controlARPU).toFixed(2)
    }
  };
}

/**
 * Get all experiment assignments (for debugging/testing)
 * 
 * @returns All experiment assignments
 */
export async function getAllAssignments(): Promise<Array<{ userId: string; experimentId: string; variant: string }>> {
  return storage.getAllAssignments();
}

/**
 * Clear all assignments and results (useful for testing)
 */
export async function clearAll(): Promise<void> {
  await storage.clear();
}
