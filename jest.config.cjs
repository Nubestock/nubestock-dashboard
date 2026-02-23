/**
 * @type {import('jest').Config}
 * Configuración de Jest para React + Vite + TypeScript
 */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/__tests__'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  
  collectCoverageFrom: [
    // Solo analizar componentes (excepto UI de shadcn)
    'src/app/components/**/*.{ts,tsx}',
    // Excluir archivos que no deben tener cobertura
    '!src/**/*.d.ts',
    '!src/vite-env.d.ts',
    '!src/main.tsx',
    '!src/types/**',
    '!src/styles/**',
    '!src/app/components/ui/**',
    // Excluir contexts, hooks, utils, examples, config
    '!src/app/contexts/**',
    '!src/app/hooks/**',
    '!src/app/utils/**',
    '!src/app/examples/**',
    '!src/app/config/**',
    '!src/app/types/**',
  ],
  
  coverageDirectory: 'coverage',
  coverageReporters: [
    'text',
    'text-summary',
    'lcov',
    'html',
  ],
  
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
      branches: 0,
      functions: 0,
      lines: 0,
      statements: 0,
    },
  },
  
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__tests__/__mocks__/fileMock.js',
  },
  
  setupFilesAfterEnv: ['<rootDir>/__tests__/setup.ts'],
  
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.test.json',
    }],
  },
  
  transformIgnorePatterns: [
    'node_modules/(?!(axios|lucide-react)/)',
  ],
};
