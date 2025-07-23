import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import AddPlayerScreen from '../AddPlayerScreen';
import { AuthProvider } from '../../../contexts/AuthContext';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { supabase } from '../../../services/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { TeamStackParamList } from '../../../types/navigationTypes';

// Mock dependencies
jest.mock('../../../services/supabase');
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: jest.fn(),
}));

const Stack = createNativeStackNavigator();

type Props = NativeStackScreenProps<TeamStackParamList, 'AddPlayer'>;

const renderAddPlayerScreen = () => {
  return render(
    <NavigationContainer>
      <ThemeProvider>
        <AuthProvider>
          <Stack.Navigator>
            <Stack.Screen 
              name="AddPlayer" 
              component={(props: any) => (
                <AddPlayerScreen 
                  {...props} 
                  route={{ params: { teamId: 'team123' } }}
                />
              )}
            />
          </Stack.Navigator>
        </AuthProvider>
      </ThemeProvider>
    </NavigationContainer>
  );
};

describe('AddPlayerScreen', () => {
  let mockQueryClient: any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockQueryClient = {
      invalidateQueries: jest.fn(),
    };
    (useQueryClient as jest.Mock).mockReturnValue(mockQueryClient);
  });

  it('should search for players successfully', async () => {
    // Mock successful search
    (supabase.from('player_profiles').select as jest.Mock).mockReturnValue({
      ilike: jest.fn().mockReturnValue({
        or: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue({
            data: [{
              id: 'player123',
              first_name: 'John',
              last_name: 'Doe',
              position: 'Forward'
            }],
            error: null
          })
        })
      })
    });

    const { getByPlaceholderText, findByText } = renderAddPlayerScreen();
    const searchInput = getByPlaceholderText('Nom ou prénom');

    fireEvent.changeText(searchInput, 'John');

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('player_profiles');
      expect(findByText('John Doe')).toBeTruthy();
    });
  });

  it('should add a player successfully', async () => {
    // Mock successful player addition
    (supabase.from('team_members').insert as jest.Mock).mockResolvedValue({
      error: null
    });

    const { getByPlaceholderText, findByText } = renderAddPlayerScreen();
    const searchInput = getByPlaceholderText('Nom ou prénom');

    // Search for player
    fireEvent.changeText(searchInput, 'John');
    await waitFor(() => expect(findByText('John Doe')).toBeTruthy());

    // Select and add player
    const playerCard = await findByText('John Doe');
    fireEvent.press(playerCard);
    const addButton = await findByText('Ajouter à l\'équipe');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(supabase.from('team_members').insert).toHaveBeenCalledWith([
        {
          user_id: 'player123',
          role: 'player',
        }
      ]);
      expect(mockQueryClient.invalidateQueries).toHaveBeenCalledWith({
        queryKey: ['team-members']
      });
    });
  });

  it('should handle player addition error', async () => {
    // Mock player addition error
    (supabase.from('team_members').insert as jest.Mock).mockResolvedValue({
      error: new Error('Addition failed')
    });

    const { getByPlaceholderText, findByText } = renderAddPlayerScreen();
    const searchInput = getByPlaceholderText('Nom ou prénom');

    // Search for player
    fireEvent.changeText(searchInput, 'John');
    await waitFor(() => expect(findByText('John Doe')).toBeTruthy());

    // Select and add player
    const playerCard = await findByText('John Doe');
    fireEvent.press(playerCard);
    const addButton = await findByText('Ajouter à l\'équipe');
    fireEvent.press(addButton);

    await waitFor(() => {
      expect(mockQueryClient.invalidateQueries).not.toHaveBeenCalled();
    });
  });

  it('should send invitation successfully', async () => {
    // Mock successful invitation
    (supabase.from('team_invitations').insert as jest.Mock).mockResolvedValue({
      error: null
    });

    const { getByPlaceholderText } = renderAddPlayerScreen();
    const emailInput = getByPlaceholderText('Adresse email');

    fireEvent.changeText(emailInput, 'test@example.com');
    fireEvent(emailInput, 'submitEditing');

    await waitFor(() => {
      expect(supabase.from('team_invitations').insert).toHaveBeenCalledWith([
        {
          email: 'test@example.com',
          expires_at: expect.any(String)
        }
      ]);
    });
  });
});