import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';
import { useDatabase } from '../hooks/useDatabase';

interface DatabaseInitializerProps {
  children: React.ReactNode;
}

export const DatabaseInitializer: React.FC<DatabaseInitializerProps> = ({ children }) => {
  const { isInitialized } = useDatabase();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
        <Text>Initializing database...</Text>
      </View>
    );
  }

  return <>{children}</>;
};
