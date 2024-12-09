import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider as PaperProvider } from 'react-native-paper';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import AuthNavigator from './navigation/AuthNavigator';
import MainNavigator from './navigation/MainNavigator';
import { useAuth } from './hooks/useAuth';
import { StatusBar } from 'expo-status-bar';

const Stack = createNativeStackNavigator();

const AppContent = () => {
  const { user } = useAuth();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      ) : (
        <Stack.Screen name="Main" component={MainNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <NavigationContainer>
      <AuthProvider>
        <ThemeProvider>
          <PaperProvider>
            <StatusBar style="auto" />
            <AppContent />
          </PaperProvider>
        </ThemeProvider>
      </AuthProvider>
    </NavigationContainer>
  );
}
