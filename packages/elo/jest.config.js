module.exports = {
  testEnvironment: 'node',
  preset: 'ts-jest',
  rootDir: '.',
  testMatch: ['<rootDir>/__tests__/**/*.test.ts'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  testTimeout: 10000,
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
