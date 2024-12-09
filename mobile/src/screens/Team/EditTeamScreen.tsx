import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Text,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList, Team } from '../../types';
import { supabase } from '../../services/supabase';
import { useAuth } from '../../hooks/useAuth';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { z } from 'zod';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

type Props = NativeStackScreenProps<TeamStackParamList, 'EditTeam'>;

const editTeamSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .min(1, 'Le nom est requis'),
  description: z.string()
    .min(1, 'La description est requise'),
  sport: z.string()
    .min(1, 'Le sport est requis'),
});

type EditTeamFormData = z.infer<typeof editTeamSchema>;

const EditTeamScreen: React.FC<Props> = ({ navigation, route }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [team, setTeam] = useState<Team | null>(null);
  const [logoUri, setLogoUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { control, handleSubmit, reset, formState: { errors } } = useForm<EditTeamFormData>({
    resolver: zodResolver(editTeamSchema),
    defaultValues: {
      name: '',
      description: '',
      sport: '',
    },
  });

  useEffect(() => {
    if (route.params?.teamId) {
      fetchTeam();
    }
  }, [route.params?.teamId]);

  useEffect(() => {
    if (team) {
      reset({
        name: team.name,
        description: team.description || '',
        sport: team.sport || '',
      });
      if (team.logo_url) {
        setLogoUri(team.logo_url);
      }
    }
  }, [team, reset]);

  const fetchTeam = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', route.params?.teamId)
        .single();

      if (error) throw error;
      if (data) setTeam(data);
    } catch (error) {
      console.error('Error fetching team:', error);
      setError('Erreur lors de la récupération de l\'équipe');
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
      setLogoUri(result.assets[0].uri);
    }
  };

  const onSubmit = async (data: EditTeamFormData) => {
    if (!user) return;
    setLoading(true);
    setError(null);

    try {
      let logoUrl = team?.logo_url;

      if (logoUri && logoUri !== team?.logo_url) {
        const logoPath = `team-logos/${user.id}/${Date.now()}.jpg`;
        const logoFile = await FileSystem.readAsStringAsync(logoUri, {
          encoding: FileSystem.EncodingType.Base64,
        });

        const { error: uploadError } = await supabase.storage
          .from('teams')
          .upload(logoPath, logoFile, {
            contentType: 'image/jpeg',
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from('teams')
          .getPublicUrl(logoPath);

        logoUrl = urlData.publicUrl;
      }

      const updates = {
        name: data.name,
        description: data.description,
        sport: data.sport,
        logo_url: logoUrl,
        updated_at: new Date().toISOString(),
      };

      let query = supabase.from('teams');

      if (route.params?.teamId) {
        const { error: updateError } = await query
          .update(updates)
          .eq('id', route.params.teamId);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await query
          .insert({ ...updates, owner_id: user.id });
        if (insertError) throw insertError;
      }

      navigation.goBack();
    } catch (err) {
      console.error('Error saving team:', err);
      setError('Erreur lors de la sauvegarde de l\'équipe');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <TouchableOpacity onPress={pickImage} style={styles.logoContainer}>
          {logoUri ? (
            <Image source={{ uri: logoUri }} style={styles.logo} />
          ) : (
            <View style={[styles.logo, styles.placeholderLogo]}>
              <Text>Ajouter un logo</Text>
            </View>
          )}
        </TouchableOpacity>

        <Controller
          control={control}
          name="name"
          render={({ field: { onChange, onBlur, value } }) => (
            <>
              <TextInput
                label="Nom de l'équipe"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={!!errors.name}
                mode="outlined"
                style={styles.input}
              />
              {errors.name && (
                <HelperText type="error">
                  {errors.name.message}
                </HelperText>
              )}
            </>
          )}
        />

        <Controller
          control={control}
          name="description"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Description"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              multiline
              numberOfLines={3}
              style={styles.input}
            />
          )}
        />

        <Controller
          control={control}
          name="sport"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              label="Sport"
              value={value}
              onChangeText={onChange}
              onBlur={onBlur}
              mode="outlined"
              style={styles.input}
            />
          )}
        />

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
          {route.params?.teamId ? 'Mettre à jour' : 'Créer l\'équipe'}
        </Button>
      </View>
    </ScrollView>
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
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  placeholderLogo: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  errorText: {
    marginBottom: 16,
  },
});

export default EditTeamScreen;
