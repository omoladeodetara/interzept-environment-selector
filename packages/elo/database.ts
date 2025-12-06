/**
 * Database module for Last Price multi-tenant system
 * 
 * This module re-exports database functions from the shared services module.
 * All database operations now use Supabase instead of direct PostgreSQL connections.
 * 
 * @deprecated This module is now a thin wrapper around @services/database
 * Consider importing directly from '@services/database' or '@models/types' instead
 */

// Re-export all database functions
export * from '@services/database';

// Re-export types from models
export type {
  Tenant,
  Experiment,
  Assignment,
  View,
  Conversion,
  Usage,
  Variant,
  ExperimentResults
} from '@models/types';
