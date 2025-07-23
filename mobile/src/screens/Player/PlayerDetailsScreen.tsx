import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Avatar, Card, useTheme } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList } from '../../types/navigationTypes';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import type { PlayerProfile, PlayerStats } from '../../types';

type Props = NativeStackScreenProps<TeamStackParamList, 'PlayerDetails'>;

export default function PlayerDetailsScreen({ route }: Props) {
  const theme = useTheme();
  const { playerId } = route.params;

  const { data: player, isLoading } = useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('player_profiles')
        .select('*, stats:player_stats(*)')
        .eq('id', playerId)
        .single();

      if (error) throw error;
      return data as PlayerProfile & { stats: PlayerStats };
    },
  });

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  if (!player) {
    return (
      <View style={styles.errorContainer}>
        <Text>Joueur non trouvé</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Avatar.Image
          size={80}
          source={
            player.avatar_url
              ? { uri: player.avatar_url }
              : { uri: 'https://via.placeholder.com/100x100.png?text=Player' }
          }
        />
        <View style={styles.headerInfo}>
          <Text style={styles.name}>{`${player.first_name} ${player.last_name}`}</Text>
          {player.nickname && <Text style={styles.nickname}>"{player.nickname}"</Text>}
          {player.position && <Text style={styles.position}>{player.position}</Text>}
        </View>
      </View>

      {player.bio && (
        <Card style={styles.section}>
          <Card.Content>
            <Text style={styles.sectionTitle}>Bio</Text>
            <Text>{player.bio}</Text>
          </Card.Content>
        </Card>
      )}

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Statistiques</Text>
          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.matches_played}</Text>
              <Text style={styles.statLabel}>Matchs joués</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{player.stats.average_rating.toFixed(1)}</Text>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
            {player.stats.goals !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.stats.goals}</Text>
                <Text style={styles.statLabel}>Buts</Text>
              </View>
            )}
            {player.stats.assists !== undefined && (
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{player.stats.assists}</Text>
                <Text style={styles.statLabel}>Passes décisives</Text>
              </View>
            )}
          </View>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerInfo: {
    marginLeft: 16,
    flex: 1,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  nickname: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  position: {
    fontSize: 16,
    color: '#666',
    marginTop: 4,
  },
  section: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
  },
  statItem: {
    alignItems: 'center',
    minWidth: 80,
    marginVertical: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});
