// Mock para import.meta.env en Jest
export const importMeta = {
  env: {
    VITE_API_BASE_URL: 'http://localhost:3000',
    VITE_API_TIMEOUT: '30000',
    VITE_API_CODE: 'test-code',
    MODE: 'test',
    DEV: true,
    PROD: false,
    SSR: false,
  },
};
