import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, useTheme } from 'react-native-paper';
import { useAuth } from '../../hooks/useAuth';
import { createTeam } from '../../services/team.service';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const CreateTeamScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation<NavigationProp>();
  const theme = useTheme();
  
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [sport, setSport] = useState('Football');
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

  const handleSubmit = async () => {
    console.log('Début de la création d\'équipe...');
    
    if (!user) {
      console.error('Erreur: Utilisateur non connecté');
      Alert.alert('Erreur', 'Vous devez être connecté pour créer une équipe');
      return;
    }

    if (!name.trim()) {
      console.error('Erreur: Nom d\'équipe vide');
      Alert.alert('Erreur', 'Le nom de l\'équipe est requis');
      return;
    }

    try {
      setIsLoading(true);
      console.log('Appel de createTeam avec les paramètres:', {
        name: name.trim(),
        description: description.trim(),
        sport: sport.trim(),
        userId: user.id
      });

      const result = await createTeam({
        name: name.trim(),
        description: description.trim(),
        sport: sport.trim() || 'Football',
      }, user.id);

      console.log('Résultat de createTeam:', result);

      if (result.data) {
        console.log('Équipe créée avec succès:', result.data);
        navigation.navigate('ManagedTeams');
      } else {
        console.error('Erreur dans la réponse:', result.error);
        throw new Error(result.error?.message || 'Erreur lors de la création de l\'équipe');
      }
    } catch (error) {
      console.error('Erreur complète lors de la création:', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la création de l\'équipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Créer une nouvelle équipe</Text>

      <TextInput
        label="Nom de l'équipe"
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
        label="Sport (optionnel)"
        value={sport}
        onChangeText={setSport}
        mode="outlined"
        style={styles.input}
        disabled={isLoading}
        placeholder="Football (par défaut)"
      />

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={isLoading}
        disabled={isLoading || !name.trim()}
        style={styles.button}
      >
        Créer l'équipe
      </Button>
    </ScrollView>
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
