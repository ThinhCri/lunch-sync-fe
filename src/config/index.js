// Centralized Configuration Management
const getEnv = (key, fallback = undefined) => {
  const value = import.meta.env[key];
  return value || fallback;
};

export const API_CONFIG = {
  BASE_URL: getEnv('VITE_API_BASE_URL'),
  TIMEOUT: parseInt(getEnv('VITE_API_TIMEOUT', '10000'), 10),
};

export const COGNITO_CONFIG = {
  DOMAIN: getEnv('VITE_COGNITO_DOMAIN'),
  CLIENT_ID: getEnv('VITE_COGNITO_CLIENT_ID'),
  REDIRECT_URI: getEnv('VITE_COGNITO_REDIRECT_URI'),
  LOGOUT_URI: getEnv('VITE_COGNITO_LOGOUT_URI'),
  SCOPE: 'openid profile email',
};
