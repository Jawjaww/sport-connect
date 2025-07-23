import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Button, Card, ActivityIndicator } from 'react-native-paper';
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../types/navigationTypes';
import { useTeams } from '../../hooks/useTeams';
import TeamCodeComponent from './TeamCodeComponent';
import { Team, TeamCode } from '../../types/sharedTypes'; 

type TeamCodeDetailScreenRouteProp = RouteProp<RootStackParamList, 'TeamCodeDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TeamCodeDetailScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<TeamCodeDetailScreenRouteProp>();
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
        <Text style={styles.errorText}>Erreur de chargement: {typeof error === 'string' ? error : error?.message}</Text>
        <Button 
          mode="outlined" 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          Retour
        </Button>
      </View>
    );
  }

  if (!currentTeam) {
    return (
      <View style={styles.centered}>
        <Text>Équipe non trouvée</Text>
        <Button 
          mode="outlined" 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          Retour
        </Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Détails du code d'équipe</Text>
      
      <Card>
        <Card.Title 
          title={currentTeam.name} 
          subtitle={`Code d'équipe pour ${currentTeam.sport || 'Sport non spécifié'}`} 
        />
      </Card>

      <TeamCodeComponent 
        teamId={teamId} 
        mode="dialog" 
      />

      <Button 
        mode="outlined" 
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        Retour
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginTop: 24,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
});

export default TeamCodeDetailScreen;
