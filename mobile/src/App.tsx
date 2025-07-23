import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import { initApp } from './services/initService';
import AppNavigator from './navigation/AppNavigator';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

export default function App() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    console.log('App starting...');
    const initialize = async () => {
      try {
        console.log('Initializing app...');
        const { cleanup } = await initApp();
        console.log('App initialization completed');
        return cleanup;
      } catch (error) {
        console.error('Error during app initialization:', error);
      } finally {
        setIsInitializing(false);
        console.log('Loading state changed to false');
      }
    };

    const cleanupFunction = initialize();

    return () => {
      cleanupFunction.then((cleanup) => {
        if (cleanup) {
          console.log('Cleanup function registered');
          cleanup();
        }
      });
    };
  }, []);

  if (isInitializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ThemeProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}