module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*)',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/src/__mocks__/env.ts',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native/(.*)$': '<rootDir>/node_modules/react-native/$1',
  },
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__mocks__/**',
    '!src/**/__tests__/**',
  ],
  globals: {
    'ts-jest': {
      tsconfig: {
        jsx: 'react',
      },
    },
  },
};
