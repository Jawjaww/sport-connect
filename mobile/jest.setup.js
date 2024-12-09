import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';

// Mock Animated
jest.mock('react-native/Libraries/Animated/AnimatedImplementation', () => {
  const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/AnimatedImplementation');
  return {
    ...ActualAnimated,
    timing: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
    spring: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
    decay: () => ({
      start: jest.fn(),
      stop: jest.fn(),
    }),
    sequence: jest.fn(),
    parallel: jest.fn(),
  };
});

// Mock SQLite
const mockExecuteSql = jest.fn();
const mockTransaction = jest.fn((callback) => {
  callback({ executeSql: mockExecuteSql });
  return Promise.resolve();
});

jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: mockTransaction,
    readTransaction: mockTransaction,
  })),
  SQLite: {
    openDatabase: jest.fn(() => ({
      transaction: mockTransaction,
      readTransaction: mockTransaction,
    })),
  },
}));

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}));

// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signIn: jest.fn(),
      signOut: jest.fn(),
      session: jest.fn(),
    },
    from: jest.fn(),
  })),
}));

// Mock Supabase services
jest.mock('./src/services/supabase', () => ({
  supabase: {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    upsert: jest.fn().mockReturnThis(),
    single: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
  },
  auth: {
    getUser: jest.fn().mockResolvedValue({ 
      data: { 
        user: { 
          id: 'test-user-id' 
        } 
      } 
    })
  }
}));

// Mock SQLite services
jest.mock('./src/services/sqlite.service', () => ({
  runAsync: jest.fn(),
  getAllAsync: jest.fn(),
  saveTeamCode: jest.fn(),
  getTeamCode: jest.fn()
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Ignore specific warnings
const originalConsoleError = console.error;
console.error = (...args) => {
  if (
    typeof args[0] === 'string' &&
    args[0].includes('Warning: ReactNative.createElement')
  ) {
    return;
  }
  originalConsoleError.call(console, ...args);
};
