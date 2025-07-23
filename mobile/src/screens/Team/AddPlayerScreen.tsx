import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Card, TextInput, Text, useTheme, HelperText } from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList } from '../../types/navigationTypes';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../services/supabase';
import { Player } from '../../types/sharedTypes';

type Props = NativeStackScreenProps<TeamStackParamList, 'AddPlayer'>;

export default function AddPlayerScreen({ navigation }: Props) {
  const theme = useTheme();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);

  // Recherche de joueurs
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ['player-search', searchQuery],
    queryFn: async () => {
      if (!searchQuery) return [];

      const { data, error } = await supabase
        .from('player_profiles')
        .select('*')
        .ilike('first_name', `%${searchQuery}%`)
        .or(`last_name.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;
      return data as Player[];
    },
    enabled: searchQuery.length > 2,
  });

  // Mutation pour ajouter un joueur à l'équipe
  const addPlayerMutation = useMutation({
    mutationFn: async (playerId: string) => {
      const { error } = await supabase.from('team_members').insert([
        {
          user_id: playerId,
          role: 'player',
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team-members'] });
      navigation.goBack();
    },
  });

  // Mutation pour envoyer une invitation
  const sendInvitationMutation = useMutation({
    mutationFn: async (email: string) => {
      const { error } = await supabase.from('team_invitations').insert([
        {
          email,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 jours
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      navigation.goBack();
    },
  });

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Rechercher un joueur</Text>
          <TextInput
            mode="outlined"
            label="Nom ou prénom"
            value={searchQuery}
            onChangeText={setSearchQuery}
            right={<TextInput.Icon icon="magnify" />}
          />
          <HelperText type="info" visible={true}>
            Entrez au moins 3 caractères pour rechercher
          </HelperText>

          {isLoading && <Text>Recherche en cours...</Text>}

          {searchResults?.map((player) => (
            <Card
              key={player.id}
              style={[
                styles.playerCard,
                selectedPlayer?.id === player.id && styles.selectedCard,
              ]}
              onPress={() => setSelectedPlayer(player)}
            >
              <Card.Title
                title={`${player.first_name} ${player.last_name}`}
                subtitle={player.position || 'Position non spécifiée'}
              />
            </Card>
          ))}

          {selectedPlayer && (
            <Button
              mode="contained"
              onPress={() => addPlayerMutation.mutate(selectedPlayer.id)}
              style={styles.addButton}
            >
              Ajouter à l'équipe
            </Button>
          )}
        </Card.Content>
      </Card>

      <Card style={styles.section}>
        <Card.Content>
          <Text style={styles.sectionTitle}>Inviter par email</Text>
          <TextInput
            mode="outlined"
            label="Adresse email"
            keyboardType="email-address"
            autoCapitalize="none"
            right={<TextInput.Icon icon="email" />}
            onSubmitEditing={({ nativeEvent: { text } }) =>
              sendInvitationMutation.mutate(text)
            }
          />
          <Button
            mode="outlined"
            onPress={() => {
              // Gérer l'envoi d'invitation par email
            }}
            style={styles.inviteButton}
          >
            Envoyer une invitation
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
  playerCard: {
    marginVertical: 8,
  },
  selectedCard: {
    borderColor: 'blue',
    borderWidth: 2,
  },
  addButton: {
    marginTop: 16,
  },
  inviteButton: {
    marginTop: 16,
  },
});
