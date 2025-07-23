import 'react-native-gesture-handler/jestSetup';
import '@testing-library/jest-native/extend-expect';
import { render } from '@testing-library/react-native';

// Add cleanup after each test
afterEach(() => {
  render.cleanup();
});

// Mock React Native core modules
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  
  return {
    ...RN,
    NativeModules: {
      ...RN.NativeModules,
    },
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      Version: 16,
      isTesting: true,
      select: jest.fn((obj) => obj.ios),
    },
    Animated: {
      ...RN.Animated,
      Value: jest.fn(),
      timing: jest.fn(),
      spring: jest.fn(),
      decay: jest.fn(),
      sequence: jest.fn(),
      parallel: jest.fn(),
      createAnimatedComponent: jest.fn((Component) => Component)
    }
  };
});

// Mock deprecated modules
jest.mock('@react-native-clipboard/clipboard', () => ({
  setString: jest.fn(),
  getString: jest.fn(),
}));

jest.mock('@react-native-community/push-notification-ios', () => ({
  addEventListener: jest.fn(),
  requestPermissions: jest.fn(),
}));

// Mock react-native-reanimated
jest.mock('react-native-reanimated', () => {
  const Reanimated = require('react-native-reanimated/mock');
  Reanimated.default.call = () => {};
  return Reanimated;
});

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  return {
    ...jest.requireActual('@react-navigation/native'),
    useNavigation: () => ({
      navigate: jest.fn(),
    }),
  };
});

// Mock SQLite
jest.mock('expo-sqlite', () => ({
  openDatabase: jest.fn(() => ({
    transaction: jest.fn(),
    readTransaction: jest.fn(),
  })),
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
      onAuthStateChange: jest.fn(),
      user: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      single: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
    })),
  })),
}));

// Mock Alert
jest.mock('react-native/Libraries/Alert/Alert', () => ({
  alert: jest.fn(),
}));

// Mock expo-constants
jest.mock('expo-constants', () => ({
  expoConfig: {
    extra: {
      supabaseUrl: 'http://localhost:8000',
      supabaseAnonKey: 'test-key'
    }
  }
}));

// Mock expo-secure-store
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

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
