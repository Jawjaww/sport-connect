import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, Text, useTheme, IconButton } from 'react-native-paper';
import { Player } from '../types';

interface PlayerCardProps {
  player: Player;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const PlayerCard: React.FC<PlayerCardProps> = ({
  player,
  onPress,
  onEdit,
  onDelete,
  showActions = false,
}) => {
  const theme = useTheme();

  const getPositionColor = (position: string) => {
    switch (position.toLowerCase()) {
      case 'attaquant':
        return theme.colors.error;
      case 'milieu':
        return theme.colors.primary;
      case 'défenseur':
        return theme.colors.secondary;
      case 'gardien':
        return theme.colors.tertiary;
      default:
        return theme.colors.outline;
    }
  };

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.container}>
          <View style={styles.avatarContainer}>
            <Avatar.Image
              size={60}
              source={
                player.avatar_url
                  ? { uri: player.avatar_url }
                  : { uri: 'https://via.placeholder.com/50x50.png?text=Player' }
              }
            />
          </View>

          <View style={styles.infoContainer}>
            <Text variant="titleMedium">{player.username}</Text>
            <Text
              variant="labelSmall"
              style={{ color: getPositionColor(player.position || 'unknown') }}
            >
              {player.position}
            </Text>

            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  Matchs
                </Text>
                <Text variant="bodyMedium">
                  {player.stats.matches_played}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text variant="labelSmall" style={styles.statLabel}>
                  Note
                </Text>
                <Text variant="bodyMedium">
                  {player.stats.average_rating.toFixed(1)}
                </Text>
              </View>

              {player.stats.goals !== undefined && (
                <View style={styles.statItem}>
                  <Text variant="labelSmall" style={styles.statLabel}>
                    Buts
                  </Text>
                  <Text variant="bodyMedium">{player.stats.goals}</Text>
                </View>
              )}

              {player.stats.assists !== undefined && (
                <View style={styles.statItem}>
                  <Text variant="labelSmall" style={styles.statLabel}>
                    Passes D.
                  </Text>
                  <Text variant="bodyMedium">{player.stats.assists}</Text>
                </View>
              )}
            </View>
          </View>

          {showActions && (
            <View style={styles.actionsContainer}>
              <IconButton
                icon="pencil"
                size={20}
                onPress={onEdit}
                style={styles.actionButton}
              />
              <IconButton
                icon="delete"
                size={20}
                onPress={onDelete}
                style={styles.actionButton}
              />
            </View>
          )}
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
  container: {
    flexDirection: 'row',
  },
  avatarContainer: {
    marginRight: 16,
  },
  infoContainer: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  statItem: {
    marginRight: 16,
  },
  statLabel: {
    opacity: 0.7,
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    margin: 0,
  },
});

export default PlayerCard;
