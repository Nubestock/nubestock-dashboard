/**
 * @type {import('jest').Config}
 * Configuración de Jest para React + Vite + TypeScript
 */
export default {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
    '!src/types/**',
    '!src/styles/**',
    // Excluir componentes UI de shadcn (código generado)
    '!src/app/components/ui/**',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
  ],
  
  // Reporte JUnit para Sonar (test results: pasan/fallan)
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'test-results',
        outputName: 'junit.xml',
        classNameTemplate: '{classname}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
        usePathForSuiteName: true,
      },
    ],
  ],
  
  coverageThreshold: {
    global: {
      branches: 10,
      functions: 10,
      lines: 10,
      statements: 10,
    },
  },
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    // Mock de assets estáticos
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
  
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
      useESM: true,
    }],
  },
  
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // Ignorar node_modules excepto paquetes ESM que necesitan transformación
  transformIgnorePatterns: [
    'node_modules/(?!(axios|lucide-react)/)',
  ],
};
