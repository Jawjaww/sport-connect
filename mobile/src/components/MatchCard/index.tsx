import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Match } from '../../types/sharedTypes';
import { format } from 'date-fns';

export interface MatchCardProps {
  match: Match;
  onPress?: (match: Match) => void;
}

export const MatchCard = ({ match, onPress }: MatchCardProps) => {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => onPress?.(match)}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <Text style={styles.date}>
          {format(new Date(match.date), 'MMM dd, yyyy')}
        </Text>
        <Text style={styles.status}>{match.status}</Text>
      </View>
      
      <View style={styles.content}>
        <Text style={styles.opponent}>{match.opponent}</Text>
        {match.location && (
          <Text style={styles.location}>{match.location}</Text>
        )}
      </View>

      {match.scoreA && match.scoreB && (
        <View style={styles.scoreContainer}>
          <Text style={styles.score}>
            {match.scoreA} - {match.scoreB}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  date: {
    fontSize: 14,
    color: '#666',
  },
  status: {
    fontSize: 14,
    color: '#4CAF50',
    fontWeight: '500',
  },
  content: {
    marginBottom: 8,
  },
  opponent: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: '#666',
  },
  scoreContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  score: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
  },
});
