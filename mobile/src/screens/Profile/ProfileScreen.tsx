import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, TextInput, Button, Avatar, useTheme } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { useProfile } from '../../hooks/useProfile';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { supabase } from '../../services/supabase';
import { useNavigation } from '@react-navigation/native';
import { StatsOverview } from '../../components/StatsOverview';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { HomeStackParamList } from '../../types/navigationTypes';

type Props = NativeStackScreenProps<HomeStackParamList, 'Profile'>;

const ProfileScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { profile, updateProfile, uploadAvatar } = useProfile();
  const [fullName, setFullName] = useState(profile.data?.full_name || '');
  const [isEditing, setIsEditing] = useState(false);

  const handleUpdateProfile = async () => {
    try {
      await updateProfile.mutateAsync({ full_name: fullName });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleAvatarPick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        await uploadAvatar.mutateAsync(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking avatar:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (profile.isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  const stats = [
    { label: 'Équipes', value: '0' },
    { label: 'Matchs', value: '0' },
    { label: 'Tournois', value: '0' },
  ];

  return (
    <ScrollView style={styles.container}>
      <Animated.View entering={FadeInDown} style={styles.content}>
        <View style={styles.avatarContainer}>
          <TouchableOpacity onPress={handleAvatarPick}>
            {profile.data?.avatar_url ? (
              <Avatar.Image
                size={120}
                source={{ uri: profile.data.avatar_url }}
              />
            ) : (
              <Avatar.Text
                size={120}
                label={profile.data?.full_name ? profile.data.full_name.substring(0, 2).toUpperCase() : '?'}
              />
            )}
            <View style={[styles.editAvatarButton, { backgroundColor: theme.colors.elevation.level3 }]}>
              <MaterialCommunityIcons
                name="camera"
                size={20}
                color={theme.colors.primary}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.infoContainer}>
          {isEditing ? (
            <TextInput
              label="Nom complet"
              value={fullName}
              onChangeText={setFullName}
              mode="outlined"
              style={styles.input}
            />
          ) : (
            <Text variant="headlineMedium" style={styles.name}>
              {profile.data?.full_name || 'Sans nom'}
            </Text>
          )}

          <Button
            mode={isEditing ? 'contained' : 'outlined'}
            onPress={isEditing ? handleUpdateProfile : () => setIsEditing(true)}
            style={styles.button}
            loading={updateProfile.isPending}
          >
            {isEditing ? 'Enregistrer' : 'Modifier le profil'}
          </Button>
        </View>

        <StatsOverview stats={stats} />

        <Button
          mode="outlined"
          onPress={handleSignOut}
          style={[styles.button, styles.signOutButton]}
          icon="logout"
        >
          Déconnexion
        </Button>
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  editAvatarButton: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    borderRadius: 15,
    padding: 5,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  infoContainer: {
    marginVertical: 20,
  },
  name: {
    textAlign: 'center',
    marginBottom: 10,
  },
  input: {
    marginBottom: 10,
  },
  button: {
    marginVertical: 10,
  },
  signOutButton: {
    marginTop: 40,
  },
});

export default ProfileScreen;
