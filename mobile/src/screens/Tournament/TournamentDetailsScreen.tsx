import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types/navigationTypes';
type Props = NativeStackScreenProps<HomeStackParamList, 'TournamentDetails'>;

const TournamentDetailsScreen: React.FC<Props> = ({ route, navigation }) => {
  const { tournamentId } = route.params;

  return (
    <View style={styles.container}>
      <Text>Détails du tournoi {tournamentId}</Text>
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

export default TournamentDetailsScreen;
