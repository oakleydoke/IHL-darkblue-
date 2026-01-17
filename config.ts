
const getEnv = (key: string, fallback: any = ''): any => {
  try {
    const metaEnv = (import.meta as any).env;
    if (metaEnv && metaEnv[key] !== undefined) return metaEnv[key];
  } catch (e) {}

  try {
    if (typeof process !== 'undefined' && process.env && process.env[key] !== undefined) return process.env[key];
  } catch (e) {}

  return fallback;
};

const isProd = (import.meta as any).env.PROD;

export const ENV = {
  API_BASE_URL: '/api', 
  STRIPE_PUBLIC_KEY: getEnv('VITE_STRIPE_PUBLIC_KEY', ''),
  APP_URL: typeof window !== 'undefined' ? window.location.origin : '',
  // Mocks are only active if explicitly requested AND not in production
  USE_MOCKS: isProd ? false : getEnv('VITE_USE_MOCKS', true), 
  API_TIMEOUT: 20000,
  IS_PRODUCTION: isProd
};
