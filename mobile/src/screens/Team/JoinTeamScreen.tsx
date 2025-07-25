import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import {
  TextInput,
  Button,
  Text,
  Card,
  Avatar,
  useTheme,
  HelperText,
} from 'react-native-paper';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { TeamStackParamList } from '../../types/navigationTypes';
import { validateInvitationCode, joinTeam } from '../../services/invitationCodes';
import { useAuth } from '../../hooks/useAuth';

// Ensure that 'TeamMain' is a valid key in TeamStackParamList
// If not, add it to the TeamStackParamList definition in the navigation types.
// Example:
// export type TeamStackParamList = {
//   JoinTeam: undefined;
//   TeamMain: { teamId: string; }; // teamId is expected to be a string
//   // Add other expected keys here, e.g.
//   // TeamSettings: { teamId: string; settingId: number; };
//   // TeamMembers: { teamId: string; memberId: string; };
//   // TeamInvitations: { teamId: string; invitationId: string; };
// };

// When adding new keys to TeamStackParamList, make sure to update the corresponding screen components
// to handle the new parameters correctly.

type Props = NativeStackScreenProps<TeamStackParamList, 'JoinTeam'>;

const JoinTeamScreen: React.FC<Props> = ({ navigation }) => {
  const theme = useTheme();
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teamData, setTeamData] = useState<any>(null);

  const handleValidateCode = async () => {
    if (!code.trim()) {
      setError('Veuillez entrer un code d\'invitation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await validateInvitationCode(code.trim().toUpperCase());
      
      if (error) {
        setError('Code d\'invitation invalide ou expiré');
        setTeamData(null);
      } else {
        setTeamData(data);
      }
    } catch (err) {
      setError('Une erreur est survenue');
      setTeamData(null);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinTeam = async () => {
    if (!user || !user.id || !teamData || !teamData.team || !teamData.team.id) {
      setError('Informations manquantes pour rejoindre l\'équipe.');
      return;
    }

    console.log('teamData:', teamData);
    console.log('user:', user);
    console.log('teamData:', teamData);
    console.log('user:', user);

    setLoading(true);
    try {
      const { error } = await joinTeam(user.id, teamData.team.id, 'player');
      
      if (error) {
        const errorMessage = (error as { message?: string }).message || 'Une erreur inconnue est survenue.';
        setError('Impossible de rejoindre l\'équipe: ' + errorMessage);
      } else {
        navigation.navigate('TeamDetails', { teamId: teamData.team.id.toString() });
      }
    } catch (err) {
      setError('Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall" style={styles.title}>
        Rejoindre une équipe
      </Text>

      <Text variant="bodyMedium" style={styles.description}>
        Entrez le code d'invitation fourni par le manager de l'équipe pour la rejoindre.
      </Text>

      <TextInput
        label="Code d'invitation"
        value={code}
        onChangeText={setCode}
        mode="outlined"
        autoCapitalize="characters"
        style={styles.input}
        disabled={loading || !!teamData}
      />

      {error && (
        <HelperText type="error" visible={true}>
          {error}
        </HelperText>
      )}

      {!teamData ? (
        <Button
          mode="contained"
          onPress={handleValidateCode}
          loading={loading}
          disabled={loading || !code.trim()}
          style={styles.button}
        >
          Vérifier le code
        </Button>
      ) : (
        <View style={styles.teamContainer}>
          <Card style={styles.teamCard}>
            <Card.Title
              title={teamData.team.name}
              subtitle="Équipe trouvée"
              left={(props) => (
                <Avatar.Image
                  {...props}
                  source={
                    teamData.team.logo_url
                      ? { uri: teamData.team.logo_url }
                      : { uri: 'https://via.placeholder.com/100x100.png?text=Team' }
                  }
                />
              )}
            />
            <Card.Content>
              <Text variant="bodyMedium">
                Voulez-vous rejoindre cette équipe ?
              </Text>
            </Card.Content>
            <Card.Actions>
              <Button
                onPress={() => {
                  setTeamData(null);
                  setCode('');
                }}
              >
                Annuler
              </Button>
              <Button
                mode="contained"
                onPress={handleJoinTeam}
                loading={loading}
              >
                Rejoindre
              </Button>
            </Card.Actions>
          </Card>
        </View>
      )}
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
    textAlign: 'center',
    marginBottom: 8,
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.7,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
  teamContainer: {
    marginTop: 24,
  },
  teamCard: {
    elevation: 2,
  },
});

export default JoinTeamScreen;
