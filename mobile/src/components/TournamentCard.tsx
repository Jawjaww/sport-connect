import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Tournament } from '../types';

interface TournamentCardProps {
  tournament: Tournament;
  onPress?: () => void;
}

const TournamentCard: React.FC<TournamentCardProps> = ({ tournament, onPress }) => {
  return (
    <Card onPress={onPress} style={styles.card}>
      <Card.Content>
        <Text variant="titleLarge">{tournament.name}</Text>
        <View style={styles.details}>
          <Text variant="bodyMedium">
            {format(new Date(tournament.start_date), 'PPP', { locale: fr })} -{' '}
            {format(new Date(tournament.end_date), 'PPP', { locale: fr })}
          </Text>
          <Text variant="bodyMedium">
            {tournament.teams.length} équipe{tournament.teams.length > 1 ? 's' : ''}
          </Text>
          {tournament.location && (
            <Text variant="bodyMedium">{tournament.location}</Text>
          )}
          <Text
            variant="labelSmall"
            style={[
              styles.status,
              {
                backgroundColor:
                  tournament.status === 'upcoming'
                    ? '#e3f2fd'
                    : tournament.status === 'in_progress'
                    ? '#e8f5e9'
                    : '#fff3e0',
                color:
                  tournament.status === 'upcoming'
                    ? '#1976d2'
                    : tournament.status === 'in_progress'
                    ? '#2e7d32'
                    : '#f57c00',
              },
            ]}
          >
            {tournament.status === 'upcoming'
              ? 'À venir'
              : tournament.status === 'in_progress'
              ? 'En cours'
              : 'Terminé'}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginBottom: 16,
    elevation: 2,
  },
  details: {
    marginTop: 8,
    gap: 4,
  },
  status: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginTop: 4,
  },
});

export default TournamentCard;
