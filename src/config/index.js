// Centralized Configuration Management
const getEnv = (key, fallback = undefined) => {
  const value = import.meta.env[key];
  return value || fallback;
};

export const API_CONFIG = {
  BASE_URL: getEnv('VITE_API_BASE_URL'),
  TIMEOUT: parseInt(getEnv('VITE_API_TIMEOUT', '10000'), 10),
};
