module.exports = {
  testEnvironment: 'node',
  rootDir: '..',
  testMatch: ['<rootDir>/tests/ab-testing-server/**/*.test.js'],
  modulePathIgnorePatterns: ['<rootDir>/node_modules/'],
  modulePaths: ['<rootDir>/ab-testing-server/node_modules'],
  testTimeout: 10000
};
