import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { RootStackScreenProps } from '../../types/navigationTypes';

const MatchDetailsScreen: React.FC<RootStackScreenProps<'MatchDetails'>> = ({ route, navigation }) => {
  const { matchId } = route.params;

  return (
    <View style={styles.container}>
      <Text>Détails du match {matchId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5'
  }
});

export default MatchDetailsScreen;
