export type AppMode = 'production' | 'demo' | 'fallback';

interface AppConfig {
  mode: AppMode;
  apiBaseUrl: string;
  enableLogging: boolean;
}

// Default configuration - change this to switch modes
const config: AppConfig = {
  mode: 'demo', // Change to 'production' | 'demo' | 'fallback'
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.healthwallet.ng/api/v1',
  enableLogging: true,
};

/**
 * Get the current application mode
 */
export const getAppMode = (): AppMode => config.mode;

/**
 * Set the application mode programmatically
 */
export const setAppMode = (mode: AppMode): void => {
  config.mode = mode;
  if (config.enableLogging) {
    console.log(`[HealthWallet] Mode changed to: ${mode}`);
  }
};

/**
 * Get the API base URL
 */
export const getApiBaseUrl = (): string => config.apiBaseUrl;

/**
 * Set the API base URL
 */
export const setApiBaseUrl = (url: string): void => {
  config.apiBaseUrl = url;
};

/**
 * Check if we should use mock data
 */
export const shouldUseMockData = (): boolean => {
  return config.mode === 'demo';
};

/**
 * Log a fallback message to console
 */
export const logFallback = (endpoint: string, error?: Error): void => {
  if (config.enableLogging) {
    console.warn(`[HealthWallet Fallback] ${endpoint} - Using mock data`, error?.message || '');
  }
};

/**
 * Log production error
 */
export const logProductionError = (endpoint: string, error: Error): void => {
  if (config.enableLogging) {
    console.error(`[HealthWallet Production Error] ${endpoint}:`, error.message);
  }
};

export default config;
