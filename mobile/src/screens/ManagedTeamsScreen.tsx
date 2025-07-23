import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Alert, RefreshControl } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { Text, FAB, Surface, Menu, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../types/navigationTypes';
import { MaterialIcons } from '@expo/vector-icons';
import { FlashList } from "@shopify/flash-list";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { teamService } from '../services/team.service';

import { useAuth } from '../contexts/AuthContext';
import { Team } from '../types/sharedTypes';
import { useTeams } from '../hooks/useTeams';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TeamCardProps {
  team: Team;
  onTeamUpdate: () => void;
}

const TeamCard: React.FC<TeamCardProps> = ({ team, onTeamUpdate }) => {
  const navigation = useNavigation<NavigationProp>();
  const { supabase } = useAuth();
  const theme = useTheme();
  const [teamCode, setTeamCode] = useState<string | null>(team.team_code || null);
  const [isMenuVisible, setIsMenuVisible] = useState(false);

  const handleRegenerateCode = async () => {
    try {
      const { data: newCode, error } = await teamService.regenerateTeamCode(team.id);
      if (error) throw error;
      if (newCode) {
        setTeamCode(newCode);
        Alert.alert('Code régénéré', `Nouveau code : ${newCode}`);
        onTeamUpdate();
      }
      setIsMenuVisible(false);
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la régénération du code');
    }
  };

  const handleShareCode = async () => {
    if (!teamCode) {
      Alert.alert('Erreur', 'Aucun code d\'équipe disponible');
      return;
    }

    try {
      const { teamCode: code, shareLink } = await teamService.shareTeamCode(team.id);
      if (code && shareLink) {
        await Sharing.shareAsync(shareLink, {
          dialogTitle: 'Partager le code d\'équipe',
        });
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors du partage du code');
    }
  };

  const handleDeleteTeam = async () => {
    Alert.alert(
      'Supprimer l\'équipe',
      `Voulez-vous vraiment supprimer l'équipe ${team.name} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          onPress: async () => {
            try {
              const { error } = await teamService.deleteTeam(team.id);
              if (error) throw error;
              Alert.alert('Succès', `${team.name} a été supprimée`);
              onTeamUpdate();
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'équipe');
            }
          },
          style: 'destructive',
        },
      ],
    );
  };

  const handleManageMembers = () => {
    navigation.navigate('TeamMembers', { teamId: String(team.id) });
    setIsMenuVisible(false);
  };

  return (
    <Surface style={styles.teamCard} elevation={1}>
      <View style={styles.teamCardHeader}>
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{team.name}</Text>
          <Text style={styles.teamCode}>Code : {teamCode || 'N/A'}</Text>
        </View>
        <Menu
          visible={isMenuVisible}
          onDismiss={() => setIsMenuVisible(false)}
          anchor={
            <TouchableOpacity onPress={() => setIsMenuVisible(true)}>
              <MaterialIcons name="more-vert" size={24} color="gray" />
            </TouchableOpacity>
          }
        >
          <Menu.Item 
            leadingIcon="qrcode" 
            title="Régénérer le code" 
            onPress={handleRegenerateCode} 
          />
          <Menu.Item 
            leadingIcon="share-variant" 
            title="Partager le code" 
            onPress={handleShareCode} 
          />
          <Menu.Item 
            leadingIcon="account-group" 
            title="Membres" 
            onPress={handleManageMembers} 
          />
          <Menu.Item 
            leadingIcon="delete" 
            title="Supprimer l'équipe" 
            onPress={handleDeleteTeam} 
            titleStyle={{ color: 'red' }}
          />
        </Menu>
      </View>

      {teamCode && (
        <View style={styles.teamCodeContainer}>
          <TouchableOpacity 
            style={styles.copyCodeButton}
            onPress={async () => {
              await Clipboard.setStringAsync(teamCode);
              Alert.alert('Copié !', `Le code ${teamCode} a été copié.`);
            }}
          >
            <MaterialIcons name="content-copy" size={20} color="white" />
            <Text style={styles.copyCodeText}>Copier le code</Text>
          </TouchableOpacity>
        </View>
      )}
    </Surface>
  );
};

const ManagedTeamsScreen: React.FC = () => {
  const { teams, error, isLoading, setTeams } = useTeams();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();

  const filteredTeams = teams.filter(team => team.team_code);

  const loadTeams = useCallback(async () => {
    setRefreshing(true);
    try {
      const { data: fetchedTeams, error } = await teamService.getAllTeams();
      if (error) {
        console.error('Erreur lors de la récupération des équipes:', error);
        Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des équipes.');
        return;
      }
      if (!fetchedTeams) {
        console.error('Aucune équipe trouvée');
        return;
      }
      const managedTeams = fetchedTeams.filter((team: Team) => 
        team.owner_id === user?.id || team.owner_id === null
      );
      setTeams(managedTeams);
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du chargement des équipes.');
    } finally {
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadTeams();
  }, [loadTeams]);

  const renderTeamCard = useCallback(({ item }: { item: Team }) => (
    <TeamCard team={item} onTeamUpdate={loadTeams} />
  ), [loadTeams]);

  const handleDeleteTeam = async (teamId: string) => {
    try {
      const { error } = await teamService.deleteTeam(teamId);
      if (error) throw error;
      setTeams((prevTeams: Team[]) => prevTeams.filter(team => team.id !== teamId));
      Alert.alert('Équipe supprimée', 'L\'équipe a été supprimée avec succès');
    } catch (error) {
      console.error('Erreur de suppression', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'équipe');
    }
  };

  const handleRegenerateCode = async (teamId: string): Promise<void> => {
    try {
      const team = teams.find((t: Team) => t.id === teamId);
      if (!team) {
        throw new Error('Team not found');
      }
      
      const { data: newCode, error } = await teamService.regenerateTeamCode(teamId);
      if (error) throw error;
      if (newCode) {
        setTeams((prevTeams: Team[]) => 
          prevTeams.map((team: Team) => 
            team.id === teamId 
              ? { ...team, team_code: newCode } 
              : team
          )
        );
        
        Alert.alert('Code régénéré', `Nouveau code : ${newCode}`);
      }
    } catch (error: any) {
      console.error('Erreur de régénération de code', error);
      Alert.alert('Erreur', 'Impossible de régénérer le code');
    }
  };

  const handleAddTeam = (prevTeams: Team[], team: Team) => {
    setTeams([...prevTeams, team]);
  };

  const [filterText, setFilterText] = useState('');
  const [filteredTeamsState, setFilteredTeams] = useState<Team[]>([]);

  const handleFilterTeams = () => {
    if (Array.isArray(teams)) { 
      const filteredTeams = teams.filter((team: Team) => team.name.includes(filterText));
      setFilteredTeams(filteredTeams);
    }
  };

  return (
    <View style={styles.container}>
      <FlashList
        data={filteredTeamsState.length > 0 ? filteredTeamsState : filteredTeams}
        renderItem={renderTeamCard}
        keyExtractor={(item: Team) => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text>Vous n'avez pas encore d'équipe</Text>
          </View>
        }
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={loadTeams}
            colors={['#007bff']}
          />
        }
        estimatedItemSize={200}
      />

      <FAB
        icon="plus"
        style={styles.fab}
        onPress={() => navigation.navigate('CreateTeam')}
        label="Créer une équipe"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6f9',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 80,
  },
  teamCard: {
    marginBottom: 16,
    borderRadius: 12,
  },
  teamCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teamCode: {
    fontSize: 16,
    color: '#666',
  },
  teamCodeContainer: {
    padding: 16,
  },
  copyCodeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    padding: 8,
    borderRadius: 8,
  },
  copyCodeText: {
    fontSize: 16,
    color: 'white',
    marginLeft: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});

export default ManagedTeamsScreen;
