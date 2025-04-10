
// Default environment values
const defaultEnv = {
  // System branding
  SYSTEM_NAME: 'LocalForge',
  REBRAND_MODE: false,
  
  // Model paths and ports
  MODEL_BASE_PATH: '/models',
  DEFAULT_MODEL_PORT: 8000,
  DEFAULT_MODEL_HOST: 'localhost',
  
  // Feature toggles
  ENABLE_CLOUD_SYNC: false,
  ENABLE_MODULE_MARKETPLACE: false,
  ENABLE_AGENT_WORKFLOWS: true,
  ENABLE_DIAGNOSTIC_AGENT: true,
  
  // System settings
  LOG_LEVEL: 'info',
  MAX_MODELS: 5,
  SCAN_INTERVAL_MINUTES: 60,
  
  // API keys (these would be populated from actual .env in production)
  API_KEY_OPENAI: '',
  API_KEY_HUGGINGFACE: '',
};

// Types for the environment variables
type EnvVars = typeof defaultEnv;

// Try to read from process.env if available, otherwise use defaults
const getEnvConfig = (): EnvVars => {
  // In a browser environment, we could use a global window.__ENV__ that would be injected
  // by the server. For this demo, we'll just use localStorage to simulate .env changes.
  const storedConfig = localStorage.getItem('env-config');
  
  if (storedConfig) {
    try {
      const parsedConfig = JSON.parse(storedConfig);
      return { ...defaultEnv, ...parsedConfig };
    } catch (error) {
      console.error('Failed to parse stored environment config', error);
    }
  }
  
  return { ...defaultEnv };
};

// Create the config object
const env = getEnvConfig();

// Helper to update a config value (simulates changing .env in development)
export const setEnvValue = (key: keyof EnvVars, value: any) => {
  const currentConfig = getEnvConfig();
  const newConfig = { ...currentConfig, [key]: value };
  
  localStorage.setItem('env-config', JSON.stringify(newConfig));
  
  // In a real app, we'd have a mechanism to reload the app or notify components
  // For now, we'll just update our in-memory copy
  Object.assign(env, { [key]: value });
  
  // Dispatch a custom event that components can listen for
  window.dispatchEvent(new CustomEvent('env-updated', { detail: { key, value } }));
  
  return true;
};

// Function to get all environment variables
export const getAllEnvVars = (): EnvVars => {
  return { ...env };
};

// Export the environment config
export default env;
