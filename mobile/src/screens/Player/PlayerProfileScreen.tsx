import React, { useEffect, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Avatar, Button, Card, Text, TextInput, useTheme } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../contexts/AuthContext';

type PlayerProfile = {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  nickname?: string;
  birth_date?: string;
  position?: string;
  jersey_number?: number;
  avatar_url?: string;
  bio?: string;
};

export const PlayerProfileScreen = () => {
  const { user } = useAuth();
  const theme = useTheme();
  const navigation = useNavigation();
  const [profile, setProfile] = useState<PlayerProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    try {
      if (!user) return;

      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (updatedData: Partial<PlayerProfile>) => {
    try {
      if (!user || !profile) return;

      const { error } = await supabase
        .from('player_profiles')
        .update(updatedData)
        .eq('user_id', user.id);

      if (error) throw error;
      
      setProfile({ ...profile, ...updatedData });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        // TODO: Implement image upload to storage and update avatar_url
      }
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.card}>
        <View style={styles.avatarContainer}>
          <Avatar.Image
            size={120}
            source={
              profile?.avatar_url
                ? { uri: profile.avatar_url }
                : { uri: 'https://via.placeholder.com/100x100.png?text=Avatar' }
            }
          />
          <Button
            mode="contained"
            onPress={handleImagePick}
            style={styles.changePhotoButton}
          >
            Change Photo
          </Button>
        </View>

        {isEditing ? (
          <View style={styles.form}>
            <TextInput
              label="First Name"
              value={profile?.first_name}
              onChangeText={(text) =>
                setProfile(prev => prev ? { ...prev, first_name: text } : null)
              }
              style={styles.input}
            />
            <TextInput
              label="Last Name"
              value={profile?.last_name}
              onChangeText={(text) =>
                setProfile(prev => prev ? { ...prev, last_name: text } : null)
              }
              style={styles.input}
            />
            <TextInput
              label="Nickname"
              value={profile?.nickname}
              onChangeText={(text) =>
                setProfile(prev => prev ? { ...prev, nickname: text } : null)
              }
              style={styles.input}
            />
            <TextInput
              label="Position"
              value={profile?.position}
              onChangeText={(text) =>
                setProfile(prev => prev ? { ...prev, position: text } : null)
              }
              style={styles.input}
            />
            <TextInput
              label="Jersey Number"
              value={profile?.jersey_number?.toString()}
              keyboardType="numeric"
              onChangeText={(text) =>
                setProfile(prev =>
                  prev ? { ...prev, jersey_number: parseInt(text) || undefined } : null
                )
              }
              style={styles.input}
            />
            <TextInput
              label="Bio"
              value={profile?.bio}
              multiline
              numberOfLines={4}
              onChangeText={(text) =>
                setProfile(prev => prev ? { ...prev, bio: text } : null)
              }
              style={styles.input}
            />
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => handleUpdateProfile(profile || {})}
                style={styles.button}
              >
                Save Changes
              </Button>
              <Button
                mode="outlined"
                onPress={() => {
                  setIsEditing(false);
                  fetchProfile(); // Reset to original data
                }}
                style={styles.button}
              >
                Cancel
              </Button>
            </View>
          </View>
        ) : (
          <View style={styles.profileInfo}>
            <Text variant="headlineMedium" style={styles.name}>
              {profile?.first_name} {profile?.last_name}
            </Text>
            {profile?.nickname && (
              <Text variant="titleMedium" style={styles.nickname}>
                "{profile.nickname}"
              </Text>
            )}
            {profile?.position && (
              <Text variant="bodyLarge" style={styles.position}>
                Position: {profile.position}
              </Text>
            )}
            {profile?.jersey_number && (
              <Text variant="bodyLarge" style={styles.jerseyNumber}>
                #{profile.jersey_number}
              </Text>
            )}
            {profile?.bio && (
              <Text variant="bodyMedium" style={styles.bio}>
                {profile.bio}
              </Text>
            )}
            <Button
              mode="contained"
              onPress={() => setIsEditing(true)}
              style={styles.editButton}
            >
              Edit Profile
            </Button>
          </View>
        )}
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    margin: 16,
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  changePhotoButton: {
    marginTop: 10,
  },
  form: {
    gap: 12,
  },
  input: {
    backgroundColor: 'transparent',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
  },
  profileInfo: {
    alignItems: 'center',
    gap: 8,
  },
  name: {
    textAlign: 'center',
  },
  nickname: {
    color: '#666',
  },
  position: {
    marginTop: 4,
  },
  jerseyNumber: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  bio: {
    textAlign: 'center',
    marginTop: 12,
    paddingHorizontal: 20,
  },
  editButton: {
    marginTop: 20,
  },
});

export default PlayerProfileScreen;
