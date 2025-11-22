/**
 * A/B Testing Module
 * 
 * Handles variant assignment logic, experiment tracking,
 * and analytics for A/B testing experiments.
 */

const crypto = require('crypto');
const config = require('./config');

// Hash range for variant assignment (0-99 = 100 buckets for percentage-based splits)
const HASH_BUCKET_SIZE = 100;

/**
 * In-memory storage for experiment assignments
 * In production, replace this with a database (e.g., Redis, PostgreSQL, MongoDB)
 */
const experimentAssignments = new Map();
const experimentResults = new Map();

/**
 * Assign a user to a variant for a specific experiment
 * Uses consistent random assignment based on user ID
 * 
 * @param {string} userId - The user identifier
 * @param {string} experimentId - The experiment identifier
 * @param {Object} weights - Optional weights for variants (default: 50/50 split)
 * @returns {string} The assigned variant ('control' or 'experiment')
 */
function assignVariant(userId, experimentId, weights = null) {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!experimentId || typeof experimentId !== 'string') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  // Check if user already has an assignment for this experiment
  const assignmentKey = `${userId}:${experimentId}`;
  if (experimentAssignments.has(assignmentKey)) {
    return experimentAssignments.get(assignmentKey);
  }
  
  // Use default weights if not provided
  const assignmentWeights = weights || config.experimentDefaults;
  
  // Deterministic random assignment based on user ID and experiment ID
  // This ensures the same user always gets the same variant for an experiment
  const hash = hashString(`${userId}:${experimentId}`);
  const randomValue = hash / HASH_BUCKET_SIZE; // Value between 0 and 1
  
  const variant = randomValue < assignmentWeights.controlWeight ? 'control' : 'experiment';
  
  // Store the assignment
  experimentAssignments.set(assignmentKey, variant);
  
  // Initialize experiment results if not exists
  if (!experimentResults.has(experimentId)) {
    experimentResults.set(experimentId, {
      control: { views: 0, conversions: 0, revenue: 0 },
      experiment: { views: 0, conversions: 0, revenue: 0 }
    });
  }
  
  // Increment view count
  const results = experimentResults.get(experimentId);
  results[variant].views++;
  
  if (config.nodeEnv === 'development') {
    console.log(`Assigned user ${userId} to variant "${variant}" for experiment ${experimentId}`);
  }
  
  return variant;
}

/**
 * Robust hash function for deterministic random assignment
 * Uses crypto module to ensure better distribution for A/B testing
 * 
 * @param {string} str - The string to hash
 * @returns {number} A hash value between 0 and (HASH_BUCKET_SIZE - 1)
 */
function hashString(str) {
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
 * @param {string} userId - The user identifier
 * @param {string} experimentId - The experiment identifier
 * @returns {string|null} The assigned variant or null if not assigned
 */
function getExperimentVariant(userId, experimentId) {
  const assignmentKey = `${userId}:${experimentId}`;
  return experimentAssignments.get(assignmentKey) || null;
}

/**
 * Track a conversion for an experiment
 * 
 * @param {string} userId - The user identifier
 * @param {string} experimentId - The experiment identifier
 * @param {Object} conversionData - Additional conversion data
 * @returns {Object} Updated experiment results
 */
function trackConversion(userId, experimentId, conversionData = {}) {
  // Input validation
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid userId: must be a non-empty string');
  }
  
  if (!experimentId || typeof experimentId !== 'string') {
    throw new Error('Invalid experimentId: must be a non-empty string');
  }
  
  // Get the user's variant
  const variant = getExperimentVariant(userId, experimentId);
  
  if (!variant) {
    throw new Error(`No variant assignment found for user ${userId} in experiment ${experimentId}`);
  }
  
  // Get experiment results
  const results = experimentResults.get(experimentId);
  
  if (!results) {
    throw new Error(`No results found for experiment ${experimentId}`);
  }
  
  // Update conversion metrics
  results[variant].conversions++;
  
  if (conversionData.revenue) {
    results[variant].revenue += conversionData.revenue;
  }
  
  if (config.nodeEnv === 'development') {
    console.log(`Tracked conversion for user ${userId} in variant "${variant}" for experiment ${experimentId}`);
    console.log(`Revenue: ${conversionData.revenue || 0}`);
  }
  
  return results;
}

/**
 * Get experiment results and statistics
 * 
 * @param {string} experimentId - The experiment identifier
 * @returns {Object} Experiment results with statistics
 */
function getExperimentResults(experimentId) {
  const results = experimentResults.get(experimentId);
  
  if (!results) {
    return {
      experimentId,
      status: 'not_found',
      message: 'No data available for this experiment'
    };
  }
  
  // Calculate conversion rates
  const controlConversionRate = results.control.views > 0 
    ? (results.control.conversions / results.control.views * 100).toFixed(2)
    : 0;
    
  const experimentConversionRate = results.experiment.views > 0
    ? (results.experiment.conversions / results.experiment.views * 100).toFixed(2)
    : 0;
  
  // Calculate average revenue per user
  const controlARPU = results.control.conversions > 0
    ? (results.control.revenue / results.control.conversions).toFixed(2)
    : 0;
    
  const experimentARPU = results.experiment.conversions > 0
    ? (results.experiment.revenue / results.experiment.conversions).toFixed(2)
    : 0;
  
  return {
    experimentId,
    control: {
      views: results.control.views,
      conversions: results.control.conversions,
      revenue: results.control.revenue.toFixed(2),
      conversionRate: `${controlConversionRate}%`,
      arpu: controlARPU
    },
    experiment: {
      views: results.experiment.views,
      conversions: results.experiment.conversions,
      revenue: results.experiment.revenue.toFixed(2),
      conversionRate: `${experimentConversionRate}%`,
      arpu: experimentARPU
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
 * @returns {Array} All experiment assignments
 */
function getAllAssignments() {
  const assignments = [];
  experimentAssignments.forEach((variant, key) => {
    const [userId, experimentId] = key.split(':');
    assignments.push({ userId, experimentId, variant });
  });
  return assignments;
}

module.exports = {
  assignVariant,
  getExperimentVariant,
  trackConversion,
  getExperimentResults,
  getAllAssignments
};
