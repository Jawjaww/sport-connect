import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Card } from 'react-native-paper';
import { Match } from '../types/sharedTypes';
import { useTeams } from '../hooks/useTeams';

export interface MatchCardProps {
  match: Match;
  onPress: () => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const { teams } = useTeams();
  const teamA = teams?.find(team => team.id === match.teamAId);
  const teamB = teams?.find(team => team.id === match.teamBId);

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{teamA?.name}</Text>
              <Text style={styles.teamLocation}>{teamA?.location || ''}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>{match.scoreA !== undefined ? match.scoreA : '-'}</Text>
            </View>
          </View>

          <View style={styles.teamContainer}>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName}>{teamB?.name}</Text>
              <Text style={styles.teamLocation}>{teamB?.location || ''}</Text>
            </View>
            <View style={styles.scoreContainer}>
              <Text style={styles.score}>{match.scoreB !== undefined ? match.scoreB : '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.date}>{new Date(match.date).toLocaleDateString()}</Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  teamContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 8,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  teamLocation: {
    fontSize: 14,
    color: '#666',
  },
  scoreContainer: {
    marginLeft: 16,
  },
  score: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
});
