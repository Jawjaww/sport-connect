import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { teamService } from '../../services/team.service';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigationTypes';
import { CreateTeamRequest } from '../../types/sharedTypes';
import { Team } from '../../types/sharedTypes'; // Modifié pour correspondre aux nouvelles exportations
import * as ImagePicker from 'expo-image-picker';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateTeamScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [sport, setSport] = useState('');
  const [location, setLocation] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleImagePick = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setLogoUri(result.assets[0].uri);
    }
  };

  const handleCreateTeam = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a team');
      return;
    }

    if (!name.trim()) {
      Alert.alert('Error', 'Team name is required');
      return;
    }

    try {
      setIsLoading(true);
      const teamData: CreateTeamRequest = {
        name: name.trim(),
        description: description.trim() || undefined,
        sport: sport.trim() || 'Football',
        owner_id: user.id,
        status: 'active',
        location: location.trim() || undefined,
        logo_url: logoUri || undefined,
      };

      const newTeam = await teamService.createTeam(teamData);
      if (newTeam) {
        Alert.alert('Success', 'Team created successfully');
        navigation.navigate('ManagedTeams');
      }
    } catch (error) {
      console.error('Error creating team:', error);
      Alert.alert('Error', 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create a new team</Text>

      <TextInput
        label="Team Name"
        value={name}
        onChangeText={setName}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
      />

      <TextInput
        label="Description"
        value={description}
        onChangeText={setDescription}
        multiline
        numberOfLines={4}
        style={styles.input}
        disabled={isLoading}
      />

      <TextInput
        label="Sport"
        value={sport}
        onChangeText={setSport}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
        placeholder="Football (default)"
      />

      <TextInput
        label="Location"
        value={location}
        onChangeText={setLocation}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
      />

      <Button
        mode="contained"
        onPress={handleCreateTeam}
        loading={isLoading}
        disabled={isLoading || !name.trim()}
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
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
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

export default CreateTeamScreen;
