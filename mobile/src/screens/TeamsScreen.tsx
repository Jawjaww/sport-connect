import React from 'react';
import { View, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Card, Title, Paragraph, Button, ActivityIndicator, Text } from 'react-native-paper';
import { useTeam } from '../hooks/useTeam';
import type { Team } from '../types/database';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { TeamStackParamList } from '../types/types';

type TeamsScreenNavigationProp = NativeStackNavigationProp<TeamStackParamList>;

export const TeamsScreen: React.FC = () => {
  const navigation = useNavigation<TeamsScreenNavigationProp>();
  const { userTeams } = useTeam();
  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    try {
      setRefreshing(true);
      await userTeams.refetch();
    } finally {
      setRefreshing(false);
    }
  }, [userTeams]);

  const renderTeam = ({ item }: { item: Team }) => (
    <Card 
      style={styles.card}
      onPress={() => navigation.navigate('TeamMain', { 
        teamId: item.id 
      })}
    >
      <Card.Content>
        <Title>{item.name}</Title>
        <Paragraph>{item.description}</Paragraph>
      </Card.Content>
      <Card.Actions>
        <Button 
          mode="contained" 
          onPress={() => navigation.navigate('TeamMain', {
            teamId: item.id
          })}
        >
          Voir l'équipe
        </Button>
      </Card.Actions>
    </Card>
  );

  if (userTeams.isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (userTeams.isError) {
    return (
      <View style={styles.centered}>
        <Text>Une erreur est survenue</Text>
        <Button mode="contained" onPress={() => userTeams.refetch()}>
          Réessayer
        </Button>
      </View>
    );
  }

  const EmptyComponent = () => (
    <View style={styles.centered}>
      <Text>Vous n'avez pas encore d'équipe</Text>
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('CreateTeam')}
        style={styles.createButton}
      >
        Créer une équipe
      </Button>
    </View>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={userTeams.data}
        renderItem={renderTeam}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={EmptyComponent}
      />
      <Button 
        mode="contained" 
        onPress={() => navigation.navigate('CreateTeam')}
        style={styles.fab}
      >
        Créer une équipe
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  createButton: {
    marginTop: 16,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
