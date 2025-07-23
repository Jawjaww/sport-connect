module.exports = {
  preset: 'react-native',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', './jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|@supabase/.*)',
  ],
  moduleNameMapper: {
    '^@env$': '<rootDir>/src/__mocks__/env.ts',
    '^react-native$': 'react-native',
    '^react-native/(.*)$': '<rootDir>/node_modules/react-native/$1',
    '^@react-native-async-storage/async-storage$': '<rootDir>/node_modules/@react-native-async-storage/async-storage',
    '^react-native-reanimated$': '<rootDir>/node_modules/react-native-reanimated',
    '^@supabase/supabase-js$': '<rootDir>/node_modules/@supabase/supabase-js',
    '^expo-sqlite$': '<rootDir>/node_modules/expo-sqlite',
    '^expo-secure-store$': '<rootDir>/node_modules/expo-secure-store',
    '^react-native-reanimated$': '<rootDir>/node_modules/react-native-reanimated',
    '^react-native-gesture-handler$': '<rootDir>/node_modules/react-native-gesture-handler',
    '^@testing-library/react-native$': '<rootDir>/node_modules/@testing-library/react-native',
    '^@testing-library/jest-native$': '<rootDir>/node_modules/@testing-library/jest-native',
  },
  resolver: undefined,
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
