
// Helper to safely get environment variables across different environments (Vite, Process, or Window)
const getEnv = (key: string, fallback: any = ''): any => {
  // Check Vite/Vercel import.meta.env
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key] !== undefined) return metaEnv[key];
  } catch (e) {}

  // Check process.env (Standard Node/Common Sandboxes)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) return process.env[key];
  } catch (e) {}

  return fallback;
};

export const ENV = {
  API_BASE_URL: '/api', 
  STRIPE_PUBLIC_KEY: getEnv('VITE_STRIPE_PUBLIC_KEY', 'pk_test_51...'), // Replace with your real key in production
  APP_URL: typeof window !== 'undefined' ? window.location.origin : '',
  USE_MOCKS: getEnv('VITE_USE_MOCKS', true), 
  API_TIMEOUT: 15000,
  IS_PRODUCTION: getEnv('PROD', false)
};
