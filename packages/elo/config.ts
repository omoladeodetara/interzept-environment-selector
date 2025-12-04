/**
 * Configuration Management Module
 * 
 * Loads and validates environment variables and provides
 * centralized configuration for the application.
 */

import dotenv from 'dotenv';

dotenv.config();

// Check if we're in test mode
const isTestEnv = process.env.NODE_ENV === 'test' || process.env.JEST_WORKER_ID !== undefined;

// Validate required environment variables (skip in test environment)
const requiredEnvVars = ['PAID_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0 && !isTestEnv) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example');
  process.exit(1);
}

export interface AppConfig {
  paidApiKey: string;
  paidApiBaseUrl: string;
  port: number;
  nodeEnv: string;
  webhookSecret: string | null;
  enableWebhookVerification: boolean;
  experimentDefaults: {
    controlWeight: number;
    experimentWeight: number;
  };
}

const config: AppConfig = {
  // Paid.ai API Configuration
  paidApiKey: process.env.PAID_API_KEY || (isTestEnv ? 'test-api-key' : ''),
  paidApiBaseUrl: process.env.PAID_API_BASE_URL || 'https://api.paid.ai/v1',
  
  // Server Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Webhook Configuration (optional, for production use)
  webhookSecret: process.env.WEBHOOK_SECRET || null,
  // Enable webhook signature verification (requires webhookSecret)
  enableWebhookVerification: process.env.ENABLE_WEBHOOK_VERIFICATION === 'true' || process.env.ENABLE_WEBHOOK_VERIFICATION === '1',
  
  // A/B Testing Configuration
  experimentDefaults: {
    controlWeight: 0.5,
    experimentWeight: 0.5
  }
};

// Log configuration on startup (excluding sensitive data)
if (config.nodeEnv === 'development') {
  console.log('Configuration loaded:');
  console.log(`- Environment: ${config.nodeEnv}`);
  console.log(`- Port: ${config.port}`);
  console.log(`- Paid.ai API Base URL: ${config.paidApiBaseUrl}`);
  console.log(`- API Key configured: ${config.paidApiKey ? 'Yes' : 'No'}`);
  console.log(`- Webhook Secret configured: ${config.webhookSecret ? 'Yes' : 'No'}`);
}

export default config;
