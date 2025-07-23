import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigationTypes';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'CreateTeam'>;

const TeamCreationScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');

  const handleCreateTeam = async () => {
    try {
      // TODO: Implement team creation logic
      navigation.goBack();
    } catch (error) {
      console.error('Error creating team:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.title}>
        Create New Team
      </Text>
      <TextInput
        label="Team Name"
        value={teamName}
        onChangeText={setTeamName}
        style={styles.input}
      />
      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.input}
      />
      <Button
        mode="contained"
        onPress={handleCreateTeam}
        style={styles.button}
      >
        Create Team
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 24,
  },
});

export default TeamCreationScreen;
