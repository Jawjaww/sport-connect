import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CreateTeamScreen from '../CreateTeamScreen';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { teamService } from '../../../services/team.service';
import { Alert } from 'react-native';
import { CreateTeamRequest } from '../../../types/sharedTypes';

// Mock dependencies
jest.mock('../../../services/team.service');
jest.mock('../../../services/auth.service', () => ({
  getUserId: jest.fn().mockResolvedValue('user123')
}));
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Alert: {
      alert: jest.fn()
    }
  };
});

const Stack = createNativeStackNavigator();

const renderCreateTeamScreen = () => {
  return render(
    <NavigationContainer>
      <ThemeProvider>
        <AuthProvider>
          <Stack.Navigator>
            <Stack.Screen name="CreateTeam" component={CreateTeamScreen} />
          </Stack.Navigator>
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

describe('CreateTeamScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create a team and save team code successfully', async () => {
    // Mock successful team creation
    (teamService.createTeam as jest.Mock).mockResolvedValue({
      data: [{
        id: 'team123',
        name: 'Test Team',
        sport: 'Football',
        team_code: 'ABC123'
      }],
      error: null
    });

    const { getByPlaceholderText, getByText } = renderCreateTeamScreen();

    // Fill in team name and sport
    const nameInput = getByPlaceholderText('Nom de l\'équipe');
    const sportInput = getByPlaceholderText('Sport');
    const createButton = getByText('Créer');

    fireEvent.changeText(nameInput, 'Test Team');
    fireEvent.changeText(sportInput, 'Football');
    fireEvent.press(createButton);

    const expectedTeamData: CreateTeamRequest = {
      name: 'Test Team',
      sport: 'Football',
      owner_id: 'user123',
      status: 'active'
    };

    // Wait for team creation
    await waitFor(() => {
      expect(teamService.createTeam).toHaveBeenCalledWith(expectedTeamData);
      expect(Alert.alert).toHaveBeenCalledWith(
        'Équipe créée',
        'Votre équipe a été créée avec succès. Code de l\'équipe : ABC123'
      );
    });
  });

  it('should handle team creation error', async () => {
    // Mock team creation error
    (teamService.createTeam as jest.Mock).mockResolvedValue({
      data: null,
      error: 'Creation failed'
    });

    const { getByPlaceholderText, getByText } = renderCreateTeamScreen();

    // Fill in team name and sport
    const nameInput = getByPlaceholderText('Nom de l\'équipe');
    const sportInput = getByPlaceholderText('Sport');
    const createButton = getByText('Créer');

    fireEvent.changeText(nameInput, 'Test Team');
    fireEvent.changeText(sportInput, 'Football');
    fireEvent.press(createButton);

    // Wait for error handling
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de créer l\'équipe. Veuillez réessayer.'
      );
    });
  });

  it('should handle SQLite error', async () => {
    // Mock SQLite error during team creation
    (teamService.createTeam as jest.Mock).mockResolvedValue({
      data: null,
      error: 'SQLite error'
    });

    const { getByPlaceholderText, getByText } = renderCreateTeamScreen();

    // Fill in team name and sport
    const nameInput = getByPlaceholderText('Nom de l\'équipe');
    const sportInput = getByPlaceholderText('Sport');
    const createButton = getByText('Créer');

    fireEvent.changeText(nameInput, 'Test Team');
    fireEvent.changeText(sportInput, 'Football');
    fireEvent.press(createButton);

    // Wait for error handling
    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Erreur',
        'Impossible de créer l\'équipe. Veuillez réessayer.'
      );
    });
  });
});
