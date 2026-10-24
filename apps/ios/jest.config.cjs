module.exports = {
  preset: 'jest-expo',
  setupFiles: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@mindspring/core$': '<rootDir>/../../packages/mindspring-core/src/index.ts',
  },
};
