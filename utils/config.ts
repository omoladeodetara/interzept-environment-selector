/**
 * Configuration Management Module
 * 
 * Loads and validates environment variables and provides
 * centralized configuration for the application.
 */

import dotenv from 'dotenv';
import { Config } from '@models/types';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['PAID_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  console.error('Please create a .env file based on .env.example');
  process.exit(1);
}

const config: Config = {
  // Paid.ai API Configuration
  paidApiKey: process.env.PAID_API_KEY as string,
  paidApiBaseUrl: process.env.PAID_API_BASE_URL || 'https://api.paid.ai/v1',
  
  // Server Configuration
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Webhook Configuration (optional, for production use)
  webhookSecret: process.env.WEBHOOK_SECRET || '',
  // Enable webhook signature verification (requires webhookSecret)
  // Defaults to false for development/testing. Set to 'true' or '1' to enable for production
  enableWebhookVerification: process.env.ENABLE_WEBHOOK_VERIFICATION === 'true' || process.env.ENABLE_WEBHOOK_VERIFICATION === '1',
  
  // A/B Testing Configuration
  experimentDefaults: {
    // Default split: 50% control, 50% experiment
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
