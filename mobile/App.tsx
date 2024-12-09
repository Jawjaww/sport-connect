import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator from './src/navigation/AppNavigator';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './src/contexts/AuthContext';
import { useDatabase } from './src/hooks/useDatabase';
import { ActivityIndicator, View, Text, StyleSheet } from 'react-native';
import { Provider as PaperProvider } from 'react-native-paper';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function App() {
  const { isInitialized, error } = useDatabase();

  if (error) {
    // Afficher un écran d'erreur approprié
    return (
      <View style={styles.container}>
        <Text>Une erreur est survenue lors de l'initialisation de la base de données</Text>
        <Text>{error.message}</Text>
      </View>
    );
  }

  if (!isInitialized) {
    // Afficher un écran de chargement
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <PaperProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SafeAreaProvider>
            <NavigationContainer>
              <AppNavigator />
            </NavigationContainer>
          </SafeAreaProvider>
        </AuthProvider>
      </QueryClientProvider>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
