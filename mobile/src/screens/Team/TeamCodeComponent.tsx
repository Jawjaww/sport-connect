import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Text, Button, Dialog, Portal } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { RootStackParamList } from '../../types/navigationTypes';
import { teamService } from '../../services/team.service';
import { shareContent } from '../../utils/sharing';
import { TeamCodeComponentProps } from '../../types/sharedTypes'; 

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const TeamCodeComponent: React.FC<TeamCodeComponentProps> = ({ teamId, mode }) => {
  const navigation = useNavigation<NavigationProp>();
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentMode, setCurrentMode] = useState<'view' | 'edit' | 'section'>('section');

  useEffect(() => {
    const fetchTeamCode = async () => {
      try {
        const { data: code } = await teamService.getTeamCodeDetails(teamId);
        setTeamCode(code);
      } catch (error) {
        console.error('[TeamCodeComponent] Error:', error);
      }
    };

    fetchTeamCode();
  }, [teamId]);

  const handleRegenerateCode = async () => {
    try {
      setIsLoading(true);
      const { data: result } = await teamService.regenerateTeamCode(teamId);
      
      if (result) {
        setTeamCode(result);
        Alert.alert('Code régénéré', 'Votre nouveau code d\'équipe a été généré');
      } else {
        Alert.alert('Erreur', 'Impossible de régénérer le code d\'équipe');
      }
    } catch (error) {
      console.error('Erreur lors de la régénération du code :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors de la régénération du code');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShareCode = async () => {
    if (!teamCode) {
      Alert.alert('Erreur', 'Aucun code d\'équipe disponible');
      return;
    }

    try {
      const result = await teamService.shareTeamCode(teamId);
      const { teamCode: code, shareLink } = result; // Assurez-vous que result a ces propriétés
      
      if (code && shareLink) {
        await shareContent(shareLink, 'Partager le code d\'équipe');
      } else {
        console.error('teamCode or shareLink is undefined');
      }
    } catch (error) {
      console.error('Erreur lors du partage du code :', error);
      Alert.alert('Erreur', 'Une erreur est survenue lors du partage du code');
    }
  };

  const handleCodePress = () => {
    navigation.navigate('TeamCodeDetail', { teamId, teamCode: String(teamCode) });
  };

  const renderSection = () => (
    <TouchableOpacity 
      style={styles.codeContainer} 
      onPress={handleCodePress}
      onLongPress={handleRegenerateCode}
    >
      <Text style={styles.codeLabel}>Code d'équipe</Text>
      <Text style={styles.codeText}>{teamCode || 'Non généré'}</Text>
    </TouchableOpacity>
  );

  const renderDialog = () => (
    <Portal>
      <Dialog visible={true}>
        <Dialog.Title>Code d'équipe</Dialog.Title>
        <Dialog.Content>
          <View style={styles.dialogContent}>
            <Text style={styles.codeLabel}>Votre code d'équipe :</Text>
            <Text style={styles.codeText}>{teamCode || 'Non généré'}</Text>
          </View>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleRegenerateCode} disabled={isLoading}>
            Régénérer
          </Button>
          <Button 
            onPress={handleShareCode} 
            disabled={!teamCode || isLoading}
          >
            Partager
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );

  return (
    <>
      {currentMode === 'section' ? renderSection() : renderDialog()}
    </>
  );
};

const styles = StyleSheet.create({
  codeContainer: {
    backgroundColor: '#f0f0f0',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 8,
  },
  dialogContent: {
    alignItems: 'center',
    marginVertical: 10,
  },
  codeLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  codeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default TeamCodeComponent;
