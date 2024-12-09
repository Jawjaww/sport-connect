import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  StyleSheet, 
  RefreshControl,
  TouchableOpacity,
  Dimensions 
} from 'react-native';
import { 
  Text, 
  FAB, 
  Card, 
  Chip, 
  Avatar,
  Surface,
  useTheme,
  Menu,
  Button
} from 'react-native-paper';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { FlashList } from "@shopify/flash-list";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import * as Clipboard from 'expo-clipboard';
import * as Sharing from 'expo-sharing';
import { Alert } from 'react-native';

import { getLocalTeams, deleteTeam, regenerateTeamCode, shareTeamCodeByTeamId } from '../services/team.service';
import { useAuth } from '../contexts/AuthContext';
import type { Team } from '../types/database';
import type { RootStackParamList } from '../types/navigation';
import { confirmAlert } from '../utils/alertUtils';
import { supabase } from '../services/supabase';

const { width } = Dimensions.get('window');

const TeamCard: React.FC<{ team: Team, onTeamUpdate: () => void }> = ({ team, onTeamUpdate }) => {
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [teamCode, setTeamCode] = useState(team.team_code ?? '');
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { supabase } = useAuth();

  const handleRegenerateCode = async () => {
    try {
      console.log(`🔑 Tentative de régénération du code pour l'équipe: ${team.name} (ID: ${team.id})`);
      
      // Vérifier l'existence du code actuel
      console.log(`🔍 Code actuel: ${teamCode}`);

      const newCode = await regenerateTeamCode(team.id);
      
      if (newCode) {
        console.log(`✅ Nouveau code généré: ${newCode}`);
        
        // Vérifier que le nouveau code est différent de l'ancien
        if (newCode === teamCode) {
          console.warn('⚠️ Le nouveau code est identique à l\'ancien');
        }
        
        // Mettre à jour l'état local du code
        setTeamCode(newCode);
        
        // Afficher une alerte avec le nouveau code
        Alert.alert(
          'Code régénéré', 
          `Nouveau code : ${newCode}`, 
          [{ text: 'OK', onPress: () => console.log('Alerte de code confirmée') }]
        );
        
        // Mettre à jour la liste des équipes
        onTeamUpdate();
      } else {
        console.error('❌ Échec de la génération du nouveau code');
        Alert.alert(
          'Erreur', 
          'Impossible de régénérer le code', 
          [{ text: 'OK', onPress: () => console.log('Alerte d\'erreur confirmée') }]
        );
      }
      
      // Fermer le menu
      setIsMenuVisible(false);
    } catch (error) {
      console.error('❌ Erreur complète de régénération de code', error);
      
      Alert.alert(
        'Erreur', 
        'Une erreur inattendue est survenue lors de la régénération du code', 
        [{ text: 'OK', onPress: () => console.log('Alerte d\'erreur inattendue confirmée') }]
      );
    }
  };

  const handleShareCode = async () => {
    try {
      await shareTeamCodeByTeamId(team.id);
      setIsMenuVisible(false);
    } catch (error) {
      console.error('Erreur de partage', error);
      Alert.alert('Erreur', 'Impossible de partager le code');
    }
  };

  const handleDeleteTeam = async () => {
    try {
      const confirmed = await new Promise((resolve) => {
        Alert.alert(
          'Supprimer l\'équipe',
          `Voulez-vous vraiment supprimer l'équipe ${team.name} ?`,
          [
            { text: 'Annuler', onPress: () => resolve(false), style: 'cancel' },
            { text: 'Supprimer', onPress: () => resolve(true), style: 'destructive' }
          ]
        );
      });

      if (confirmed) {
        const result = await deleteTeam(team.id);
        if (result) {
          Alert.alert('Équipe supprimée', `${team.name} a été supprimée avec succès`);
          onTeamUpdate(); // Mettre à jour la liste des équipes
        }
        setIsMenuVisible(false);
      }
    } catch (error) {
      console.error('Erreur de suppression', error);
      Alert.alert('Erreur', 'Impossible de supprimer l\'équipe');
    }
  };

  const handleManageMembers = () => {
    navigation.navigate('TeamMembers', { teamId: team.id });
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
  const [teams, setTeams] = useState<Team[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();

  const loadTeams = useCallback(async () => {
    setRefreshing(true);
    try {
      const fetchedTeams = await getLocalTeams();
      const managedTeams = fetchedTeams.filter((team: Team) => 
        team.owner_id === user?.id || team.owner_id === null
      );
      setTeams(managedTeams);
    } catch (error) {
      console.error('Erreur lors du chargement des équipes:', error);
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

  return (
    <View style={styles.container}>
      <FlashList
        data={teams}
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
        onPress={() => {}} // Aucune action pour le moment
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
