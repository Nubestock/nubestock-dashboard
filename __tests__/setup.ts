/**
 * Configuración global de tests para React + Vite.
 *
 * - Se mockean módulos comunes que pueden causar problemas en el entorno de test.
 * - Se extiende expect con matchers de @testing-library/jest-dom.
 */

import '@testing-library/jest-dom';

// window.location mutable lo proporciona jest-env-jsdom-mutable-location.cjs

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

// Polyfill crypto.randomUUID para Jest/jsdom (no lo implementa; RecipeManagement lo usa)
if (typeof globalThis.crypto !== 'undefined' && typeof globalThis.crypto.randomUUID !== 'function') {
  (globalThis.crypto as Crypto & { randomUUID?: () => string }).randomUUID = function randomUUID(): string {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6]! & 0x0f) | 0x40;
    bytes[8] = (bytes[8]! & 0x3f) | 0x80;
    const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  };
}

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
