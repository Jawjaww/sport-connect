import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Button, Card, Switch, Text, useTheme, TextInput } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList } from '../../types/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';

type Props = NativeStackScreenProps<TeamStackParamList, 'TeamSettings'>;

export default function TeamSettingsScreen({ route, navigation }: Props) {
  const theme = useTheme();
  const { teamId } = route.params;
  const queryClient = useQueryClient();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [publicTeam, setPublicTeam] = useState(false);
  const [joinCode, setJoinCode] = useState('');

  const { data: team, isLoading } = useQuery({
    queryKey: ['team-settings', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const updateTeamMutation = useMutation({
    mutationFn: async (updates: { notifications_enabled?: boolean; public?: boolean }) => {
      const { error } = await supabase
        .from('teams')
        .update(updates)
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-settings', teamId] });
    },
  });

  const generateJoinCodeMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from('team_invitations')
        .insert([
          {
            team_id: teamId,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setJoinCode(data.code);
    },
  });

  const deleteTeamMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
    },
    onSuccess: () => {
      navigation.navigate('HomeMain');
    },
  });

  const handleDeleteTeam = () => {
    Alert.alert(
      'Supprimer l\'équipe',
      'Êtes-vous sûr de vouloir supprimer cette équipe ? Cette action est irréversible.',
      [
        {
          text: 'Annuler',
          style: 'cancel',
        },
        {
          text: 'Supprimer',
          onPress: () => deleteTeamMutation.mutate(),
          style: 'destructive',
        },
      ],
    );
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text>Chargement...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.setting}>
            <Text>Activer les notifications</Text>
            <Switch
              value={notificationsEnabled}
              onValueChange={(value) => {
                setNotificationsEnabled(value);
                updateTeamMutation.mutate({ notifications_enabled: value });
              }}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Confidentialité</Text>
          <View style={styles.setting}>
            <Text>Équipe publique</Text>
            <Switch
              value={publicTeam}
              onValueChange={(value) => {
                setPublicTeam(value);
                updateTeamMutation.mutate({ public: value });
              }}
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Code d'invitation</Text>
          <TextInput
            mode="outlined"
            value={joinCode}
            disabled
            right={
              <TextInput.Icon
                icon="content-copy"
                onPress={() => {
                  if (joinCode) {
                    // Copier dans le presse-papier
                  }
                }}
              />
            }
            style={styles.codeInput}
          />
          <Button
            mode="contained"
            onPress={() => generateJoinCodeMutation.mutate()}
            style={styles.generateButton}
          >
            Générer un nouveau code
          </Button>
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Button 
            mode="contained"
            onPress={() => navigation.navigate('CreateTeam' as never)}
            style={styles.button}
          >
            Créer une nouvelle équipe
          </Button>
        </Card.Content>
      </Card>

      <Card style={[styles.section, styles.dangerZone]}>
        <Card.Content>
          <Text style={[styles.sectionTitle, styles.dangerTitle]}>Zone de danger</Text>
          <Button
            mode="contained"
            onPress={handleDeleteTeam}
            buttonColor={theme.colors.error}
            style={styles.deleteButton}
          >
            Supprimer l'équipe
          </Button>
        </Card.Content>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    margin: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  setting: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  codeInput: {
    marginBottom: 16,
  },
  generateButton: {
    marginTop: 8,
  },
  dangerZone: {
    marginTop: 32,
  },
  dangerTitle: {
    color: 'red',
  },
  deleteButton: {
    marginTop: 8,
  },
  button: {
    marginTop: 8,
  },
});
