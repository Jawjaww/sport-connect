import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text, useTheme, Avatar } from 'react-native-paper';
import { Match } from '../types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface MatchCardProps {
  match: Match;
  onPress?: () => void;
}

const MatchCard: React.FC<MatchCardProps> = ({ match, onPress }) => {
  const theme = useTheme();

  const getStatusColor = (status: Match['status']) => {
    switch (status) {
      case 'in_progress':
        return theme.colors.primary;
      case 'completed':
        return theme.colors.secondary;
      case 'cancelled':
        return theme.colors.error;
      default:
        return theme.colors.outline;
    }
  };

  const getStatusText = (status: Match['status']) => {
    switch (status) {
      case 'in_progress':
        return 'En cours';
      case 'completed':
        return 'Terminé';
      case 'cancelled':
        return 'Annulé';
      default:
        return 'À venir';
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="labelSmall" style={{ color: getStatusColor(match.status) }}>
            {getStatusText(match.status)}
          </Text>
          <Text variant="labelSmall">
            {format(new Date(match.date), 'dd MMMM yyyy - HH:mm', { locale: fr })}
          </Text>
        </View>

        <View style={styles.teamsContainer}>
          <View style={styles.teamContainer}>
            <Avatar.Image
              size={40}
              source={
                match.home_team.logo_url
                  ? { uri: match.home_team.logo_url }
                  : { uri: 'https://via.placeholder.com/50x50.png?text=Team' }
              }
            />
            <Text variant="titleMedium" style={styles.teamName}>
              {match.home_team.name}
            </Text>
          </View>

          {match.score ? (
            <View style={styles.scoreContainer}>
              <Text variant="headlineMedium">{match.score.home}</Text>
              <Text variant="titleLarge" style={styles.scoreSeparator}>
                -
              </Text>
              <Text variant="headlineMedium">{match.score.away}</Text>
            </View>
          ) : (
            <Text variant="titleLarge" style={styles.vs}>
              VS
            </Text>
          )}

          <View style={styles.teamContainer}>
            <Avatar.Image
              size={40}
              source={
                match.away_team.logo_url
                  ? { uri: match.away_team.logo_url }
                  : { uri: 'https://via.placeholder.com/50x50.png?text=Team' }
              }
            />
            <Text variant="titleMedium" style={styles.teamName}>
              {match.away_team.name}
            </Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text variant="labelSmall" style={styles.location}>
            {match.venue}
          </Text>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  teamsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  teamContainer: {
    flex: 1,
    alignItems: 'center',
  },
  teamName: {
    marginTop: 8,
    textAlign: 'center',
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  scoreSeparator: {
    marginHorizontal: 8,
  },
  vs: {
    marginHorizontal: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  location: {
    opacity: 0.7,
  },
});

export default MatchCard;
