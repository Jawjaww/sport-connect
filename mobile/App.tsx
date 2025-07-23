import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PaperProvider } from 'react-native-paper';
import { AuthProvider } from './src/contexts/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { DatabaseInitializer } from './src/components/DatabaseInitializer';
import { NotificationProvider } from './src/components/NotificationProvider';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 30, // 30 minutes
      retry: false,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <AuthProvider>
              <DatabaseInitializer>
                <NotificationProvider>
                  <AppNavigator />
                </NotificationProvider>
              </DatabaseInitializer>
            </AuthProvider>
          </NavigationContainer>
        </SafeAreaProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
