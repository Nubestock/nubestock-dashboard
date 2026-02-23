/**
 * Configuración global de tests para React + Vite.
 *
 * - Se mockean módulos comunes que pueden causar problemas en el entorno de test.
 * - Se extiende expect con matchers de @testing-library/jest-dom.
 */

import '@testing-library/jest-dom';

// Mock de variables de entorno de Vite usando globalThis
// Jest no soporta import.meta directamente, así que creamos un mock global
const mockEnv = {
  VITE_API_BASE_URL: 'http://localhost:3000',
  VITE_API_TIMEOUT: '30000',
  VITE_API_CODE: 'test-code',
  MODE: 'test',
  DEV: false,
  PROD: false,
  SSR: false,
};

// @ts-expect-error - Mock para entorno de test
globalThis.import_meta_env = mockEnv;

// Mock global de window.matchMedia (necesario para componentes responsive)
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock de ResizeObserver (necesario para algunos componentes UI)
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock de scrollTo
window.scrollTo = jest.fn();

// Suprimir warnings de console en tests (opcional)
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  console.warn = (...args: unknown[]) => {
    // Ignorar warnings de React sobre act() en testing-library
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalWarn.apply(console, args);
  };
  
  console.error = (...args: unknown[]) => {
    // Ignorar errores específicos de testing
    if (typeof args[0] === 'string' && args[0].includes('Warning: ReactDOM.render')) {
      return;
    }
    originalError.apply(console, args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
  console.error = originalError;
});
