module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  collectCoverageFrom: [
    'core/**/*.ts',
    'integrations/**/*.ts',
    'multi-tenant/**/*.ts',
    'api/**/*.ts',
    '!**/*.d.ts',
  ],
  coverageDirectory: 'coverage',
  verbose: true,
};
