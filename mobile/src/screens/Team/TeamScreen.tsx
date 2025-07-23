import React from 'react';
import { View, Text } from 'react-native';
import { useTeams } from '../../hooks/useTeams';
import { Team } from '../../types/sharedTypes';

const TeamScreen = () => {
  const { teams, isLoading, error } = useTeams();

  if (isLoading) return <Text>Loading...</Text>;
  if (error) return <Text>Error loading teams</Text>;

  return (
    <View>
      {teams && teams.map((team: Team) => (
        <View key={team.id}>
          <Text>{team.name}</Text>
          <Text>{team.description}</Text>
        </View>
      ))}
    </View>
  );
};

export default TeamScreen;
