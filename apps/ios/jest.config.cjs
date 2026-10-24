module.exports = {
  preset: 'jest-expo',
  testMatch: ['<rootDir>/src/**/*.test.ts', '<rootDir>/src/**/*.test.tsx'],
  moduleNameMapper: {
    '^@mindspring/core$': '<rootDir>/../../packages/mindspring-core/src/index.ts',
  },
};
