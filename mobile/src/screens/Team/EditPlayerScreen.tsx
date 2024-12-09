import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
  SegmentedButtons,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList, Player } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import PositionSelector from '../../components/PositionSelector';

type Props = NativeStackScreenProps<TeamStackParamList, 'EditPlayer'>;

const playerRoles = ['player', 'coach', 'admin'] as const;

const editPlayerSchema = z.object({
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .min(1, 'Le nom d\'utilisateur est requis'),
  email: z.string()
    .email('Email invalide')
    .min(1, 'L\'email est requis'),
  position: z.string()
    .min(1, 'La position est requise'),
  role: z.enum(playerRoles),
  phone_number: z.string().optional(),
  jersey_number: z.string().optional(),
  stats: z.object({
    goals: z.string().optional(),
    assists: z.string().optional(),
    games_played: z.string().optional(),
  }),
});

type EditPlayerFormData = z.infer<typeof editPlayerSchema>;

const EditPlayerScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [player, setPlayer] = useState<Player | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditPlayerFormData>({
    resolver: zodResolver(editPlayerSchema),
    defaultValues: {
      username: '',
      email: '',
      position: '',
      role: 'player',
      phone_number: '',
      jersey_number: '',
      stats: {
        goals: '0',
        assists: '0',
        games_played: '0',
      },
    },
  });

  useEffect(() => {
    if (route.params?.playerId) {
      fetchPlayer();
    }
  }, [route.params?.playerId]);

  useEffect(() => {
    if (player) {
      reset({
        username: player.username,
        email: player.email,
        position: player.position,
        role: player.role as typeof playerRoles[number],
        phone_number: player.phone_number || '',
        jersey_number: player.jersey_number || '',
        stats: {
          goals: player.stats?.goals?.toString() || '0',
          assists: player.stats?.assists?.toString() || '0',
          games_played: player.stats?.games_played?.toString() || '0',
        },
      });
      if (player.avatar_url) {
        setAvatarUri(player.avatar_url);
      }
    }
  }, [player, reset]);

  const fetchPlayer = async () => {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', route.params?.playerId)
        .single();

      if (error) throw error;
      if (data) setPlayer(data);
    } catch (error) {
      console.error('Error fetching player:', error);
      setError('Erreur lors de la récupération du joueur');
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: EditPlayerFormData) => {
    if (!user || !route.params?.teamId) return;
    setLoading(true);
    setError(null);

    try {
      let avatarUrl = player?.avatar_url;

      if (avatarUri && avatarUri !== player?.avatar_url) {
        const avatarPath = `player-avatars/${route.params.teamId}/${Date.now()}.jpg`;
        const avatarFile = await FileSystem.readAsStringAsync(avatarUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { error: uploadError } = await supabase.storage
          .from('players')
          .upload(avatarPath, avatarFile, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('players')
          .getPublicUrl(avatarPath);

        avatarUrl = urlData.publicUrl;
      }

      const updates = {
        username: data.username,
        email: data.email,
        position: data.position,
        role: data.role,
        phone_number: data.phone_number,
        jersey_number: data.jersey_number,
        avatar_url: avatarUrl,
        stats: {
          goals: parseInt(data.stats?.goals || '0', 10),
          assists: parseInt(data.stats?.assists || '0', 10),
          games_played: parseInt(data.stats?.games_played || '0', 10),
        },
        team_id: route.params.teamId,
        updated_at: new Date().toISOString(),
      };

      let query = supabase.from('players');

      if (route.params?.playerId) {
        const { error: updateError } = await query
          .update(updates)
          .eq('id', route.params.playerId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await query
          .insert({ ...updates, created_by: user.id });
        if (insertError) throw insertError;
      }

      navigation.goBack();
    } catch (err) {
      console.error('Error saving player:', err);
      setError('Erreur lors de la sauvegarde du joueur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.content}>
        <TouchableOpacity onPress={pickImage} style={styles.avatarContainer}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, styles.placeholderAvatar]}>
              <Text>Ajouter une photo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Controller
          control={control}
          name="username"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Nom du joueur"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.username}
                mode="outlined"
                style={styles.input}
              />
              {errors.username && (
                <HelperText type="error">
                  {errors.username.message}
                </HelperText>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="email"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Email"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.email}
                keyboardType="email-address"
                autoCapitalize="none"
                mode="outlined"
                style={styles.input}
              />
              {errors.email && (
                <HelperText type="error">
                  {errors.email.message}
                </HelperText>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="phone_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Numéro de téléphone"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="phone-pad"
              mode="outlined"
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="jersey_number"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Numéro de maillot"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              keyboardType="number-pad"
              mode="outlined"
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="position"
          render={({ field: { onChange, value } }) => (
            <>
              <PositionSelector
                value={value}
                onValueChange={onChange}
                error={!!errors.position}
              />
              {errors.position && (
                <HelperText type="error">
                  {errors.position.message}
                </HelperText>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="role"
          render={({ field: { onChange, value } }) => (
            <>
              <Text style={styles.label}>Rôle</Text>
              <SegmentedButtons
                value={value}
                onValueChange={onChange}
                buttons={[
                  { value: 'player', label: 'Joueur' },
                  { value: 'coach', label: 'Coach' },
                  { value: 'admin', label: 'Admin' },
                ]}
                style={styles.segmentedButtons}
              />
              {errors.role && (
                <HelperText type="error">
                  {errors.role.message}
                </HelperText>
              )}
            </>
          )}
        />

        <View style={styles.statsContainer}>
          <Text style={styles.label}>Statistiques</Text>
          <Controller
            control={control}
            name="stats.goals"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Buts"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                mode="outlined"
                style={styles.statsInput}
              />
            )}
          />

          <Controller
            control={control}
            name="stats.assists"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Passes décisives"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                mode="outlined"
                style={styles.statsInput}
              />
            )}
          />

          <Controller
            control={control}
            name="stats.games_played"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                label="Matchs joués"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                keyboardType="number-pad"
                mode="outlined"
                style={styles.statsInput}
              />
            )}
          />
        </View>

        {error && (
          <HelperText type="error" style={styles.errorText}>
            {error}
          </HelperText>
        )}

        <Button
          mode="contained"
          onPress={handleSubmit(onSubmit)}
          loading={loading}
          disabled={loading}
          style={styles.button}
        >
          {route.params?.playerId ? 'Mettre à jour' : 'Ajouter le joueur'}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 16,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderAvatar: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 8,
  },
  label: {
    marginBottom: 4,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  statsContainer: {
    marginBottom: 16,
  },
  statsInput: {
    marginBottom: 8,
  },
  button: {
    marginTop: 24,
    marginBottom: 16,
  },
  errorText: {
    marginBottom: 16,
  },
});

export default EditPlayerScreen;
