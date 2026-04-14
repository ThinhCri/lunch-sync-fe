// Centralized Configuration Management
const getEnv = (key, fallback = undefined) => {
  const value = import.meta.env[key];
  if (!value && fallback === undefined) {
    console.error(`[Config Error]: Environment variable ${key} is missing!`);
  }
  return value || fallback;
};

export const API_CONFIG = {
  // No hardcoded fallback for BASE_URL to ensure .env is used
  BASE_URL: getEnv('VITE_API_BASE_URL'),
  TIMEOUT: parseInt(getEnv('VITE_API_TIMEOUT', '10000'), 10),
};
