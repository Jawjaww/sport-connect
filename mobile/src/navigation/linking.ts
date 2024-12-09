import { LinkingOptions } from '@react-navigation/native';
import { Linking } from 'react-native';
import { RootStackParamList } from '../types/navigation';

export const linking: LinkingOptions<RootStackParamList> = {
  prefixes: [
    'sportconnect://', // Scheme URL pour l'app
    'https://sportconnect.app', // URL de production (à remplacer par votre domaine)
    'http://localhost:3000', // Pour le développement local
  ],
  config: {
    screens: {
      Auth: {
        screens: {
          Login: 'login',
          Register: 'register',
          ForgotPassword: 'forgot-password',
          ResetPassword: 'reset-password/:token',
        },
      },
      Main: {
        screens: {
          HomeMain: 'home',
          TeamMain: 'team',
          Tournaments: 'tournaments',
          Statistics: 'statistics',
          Notifications: 'notifications',
          Settings: 'settings',
        },
      },
      Home: {
        screens: {
          HomeMain: 'home',
          MatchDetails: 'match/:matchId',
          TournamentDetails: 'tournament/:tournamentId',
        },
      },
      Team: {
        screens: {
          TeamMain: 'team',
          CreateTeam: 'create',
          JoinTeam: 'join',
          TeamMembers: 'members/:teamId',
          EditTeam: 'edit/:teamId',
          EditPlayer: 'player/:playerId/edit',
          AddPlayer: 'add-player',
          PlayerDetails: 'player/:playerId',
          EditProfile: 'profile/edit',
          TeamSettings: 'settings/:teamId',
        },
      },
      PlayerProfile: 'player/:playerId',
      CreateTeam: 'create-team',
      JoinTeam: 'join-team',
      TeamMembers: 'team/:teamId/members',
      EditTeam: 'team/:teamId/edit',
      EditPlayer: 'team/:teamId/player/:playerId/edit',
      AddPlayer: 'team/:teamId/add-player',
    },
  },
  async getInitialURL() {
    const url = await Linking.getInitialURL();
    return url;
  },
  subscribe(listener) {
    const subscription = Linking.addEventListener('url', ({ url }) => {
      listener(url);
    });

    return () => {
      subscription.remove();
    };
  },
};
