
const getEnv = (key: string, fallback: any = ''): any => {
  // Try Vite/Vercel standard
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key] !== undefined) return metaEnv[key];
  } catch (e) {}

  // Try Process (Node-like environments)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) return process.env[key];
  } catch (e) {}

  return fallback;
};

// Safely detect production environment
const meta = import.meta as any;
const isProd = meta?.env?.PROD || false;

export const ENV = {
  API_BASE_URL: '/api', 
  STRIPE_PUBLIC_KEY: getEnv('VITE_STRIPE_PUBLIC_KEY', ''),
  GEMINI_API_KEY: getEnv('API_KEY', ''),
  APP_URL: typeof window !== 'undefined' ? window.location.origin : '',
  // Force mocks to false in production, otherwise allow toggle
  USE_MOCKS: isProd ? false : (getEnv('VITE_USE_MOCKS', 'true') === 'true'), 
  API_TIMEOUT: 20000,
  IS_PRODUCTION: isProd
};
