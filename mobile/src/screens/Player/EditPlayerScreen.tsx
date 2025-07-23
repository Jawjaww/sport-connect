import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RootStackScreenProps } from '../../types/navigationTypes';

type Props = RootStackScreenProps<'EditPlayer'>;

const EditPlayerScreen: React.FC<Props> = ({ route, navigation }) => {
  const { playerId, teamId } = route.params;

  return (
    <View style={styles.container}>
      <Text>Edit Player Screen</Text>
      <Text>Player ID: {playerId}</Text>
      <Text>Team ID: {teamId}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default EditPlayerScreen;
