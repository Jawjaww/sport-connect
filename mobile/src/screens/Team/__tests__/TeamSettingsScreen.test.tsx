import React from 'react';
import { render, act } from '@testing-library/react-native';
import TeamSettingsScreen from '../TeamSettingsScreen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { TeamStackParamList } from '../../../types/navigationTypes';

// Mock des hooks essentiels
jest.mock('../../../hooks/useTeam', () => ({
  useTeam: jest.fn(),
}));

const mockUseTeam = jest.fn() as jest.MockedFunction<typeof useTeam>;
jest.mock('../../../hooks/useTeam', () => ({
  useTeam: mockUseTeam,
}));

const queryClient = new QueryClient();

const mockRoute = {
  key: 'test-key',
  name: 'TeamSettings',
  params: { teamId: 'test-team' }
} as unknown as { 
  key: string;
  name: 'TeamSettings';
  params: { teamId: string };
};

const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn()
} as unknown as NativeStackNavigationProp<TeamStackParamList, 'TeamSettings'>;

const renderScreen = () => {
  return render(
    <QueryClientProvider client={queryClient}>
      <TeamSettingsScreen 
        route={mockRoute}
        navigation={mockNavigation}
      />
    </QueryClientProvider>
  );
};

describe('TeamSettingsScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render team name', async () => {
    if (mockUseTeam) {
      mockUseTeam.mockReturnValue({
        data: { id: 'test-team', name: 'Test Team', sport: 'Football' },
        isLoading: false,
        isError: false,
      });
    }

    let getByText;
    await act(async () => {
      ({ getByText } = renderScreen());
    });

    expect(getByText('Test Team')).toBeTruthy();
  });

  it('should render loading state', async () => {
    if (mockUseTeam) {
      mockUseTeam.mockReturnValue({
        data: undefined,
        isLoading: true,
        isError: false,
      });
    }

    let getByText;
    await act(async () => {
      ({ getByText } = renderScreen());
    });

    expect(getByText('Chargement...')).toBeTruthy();
  });

  it('should render error state', async () => {
    if (mockUseTeam) {
      mockUseTeam.mockReturnValue({
        data: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Erreur de chargement'),
      });
    }

    let getByText;
    await act(async () => {
      ({ getByText } = renderScreen());
    });

    expect(getByText('Erreur: Erreur de chargement')).toBeTruthy();
  });
});
