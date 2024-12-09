import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, ActivityIndicator, Card } from 'react-native-paper';
import { RootStackScreenProps } from '../../types/navigation';
import { useTeams } from '../../hooks/useTeams';
import TeamCodeComponent from './TeamCodeComponent';

type Props = RootStackScreenProps<'TeamMain'>;

export default function TeamScreen({ route }: Props) {
  const { teamId } = route.params;
  const { currentTeam, loading, error } = useTeams(teamId);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator animating={true} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Erreur de chargement: {error.message}</Text>
      </View>
    );
  }

  if (!currentTeam) {
    return (
      <View style={styles.centered}>
        <Text>Équipe non trouvée</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card>
        <Card.Title 
          title={currentTeam.name} 
          subtitle={currentTeam.sport || 'Sport non spécifié'} 
        />
        <Card.Content>
          {currentTeam.description && (
            <Text>{currentTeam.description}</Text>
          )}
          {currentTeam.location && (
            <Text>Localisation: {currentTeam.location}</Text>
          )}
        </Card.Content>
      </Card>

      <TeamCodeComponent teamId={teamId} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});
