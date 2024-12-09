import type { 
  NativeStackScreenProps,
  NativeStackNavigationProp 
} from '@react-navigation/native-stack';
import type { 
  BottomTabScreenProps,
  BottomTabNavigationProp 
} from '@react-navigation/bottom-tabs';
import type { 
  CompositeScreenProps,
  NavigatorScreenParams,
  ParamListBase
} from '@react-navigation/native';

export interface HomeStackParamList extends ParamListBase {
  HomeMain: undefined;
  MatchDetails: { matchId: string };
  TournamentDetails: { tournamentId: string };
  TeamCreation: undefined;
  TeamCode: { teamId: string; teamCode: string; isNewTeam?: boolean };
  Profile: undefined;
};

export interface TeamStackParamList extends ParamListBase {
  TeamMain: { teamId: string };
  JoinTeam: undefined;
  CreateTeam: undefined;
  EditTeam: { teamId: string };
  PlayerDetails: { playerId: string };
  EditPlayer: { playerId: string; teamId: string };
  EditProfile: undefined;
  TeamSettings: { teamId: string };
  TeamMembers: { teamId: string };
  TeamCode: { teamId: string; teamCode: string; isNewTeam?: boolean };
  AddPlayer: undefined;
  HomeMain: undefined; // Allow navigation to main screen
};

export interface AuthStackParamList extends ParamListBase {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
};

export interface MainTabParamList extends ParamListBase {
  HomeMain: undefined;
  TeamMain: undefined;
  Tournaments: undefined;
  Statistics: undefined;
  Notifications: undefined;
  Settings: undefined;
};

export interface RootStackParamList extends ParamListBase {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Home: undefined;
  TeamMain: { teamId: string };
  PlayerProfile: { playerId: string };
  CreateTeam: undefined;
  JoinTeam: undefined;
  TeamMembers: { teamId: string };
  EditTeam: { teamId: string };
  EditPlayer: { playerId: string; teamId: string };
  ManagedTeams: undefined;
  MatchDetails: { matchId: string };
  TournamentDetails: { tournamentId: string };
  TeamCodeDetail: { teamId: string };
  Profile: undefined;
};

export interface TournamentsStackParamList extends ParamListBase {
  TournamentsMain: undefined;
  TournamentDetails: { tournamentId: string };
  CreateTournament: undefined;
};

export interface StatisticsStackParamList extends ParamListBase {
  StatisticsMain: undefined;
  PlayerProfile: { playerId: string };
  TeamProfile: { teamId: string };
};

export type HomeStackScreenProps<T extends keyof HomeStackParamList> = 
  NativeStackScreenProps<HomeStackParamList, T>;

export type TeamStackScreenProps<T extends keyof TeamStackParamList> = 
  NativeStackScreenProps<TeamStackParamList, T>;

export type AuthStackScreenProps<T extends keyof AuthStackParamList> = 
  NativeStackScreenProps<AuthStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> = 
  BottomTabScreenProps<MainTabParamList, T>;

export type RootStackScreenProps<T extends keyof RootStackParamList> = 
  NativeStackScreenProps<RootStackParamList, T>;

// Navigation prop types
export type HomeStackNavigationProp = NativeStackNavigationProp<HomeStackParamList>;
export type TeamStackNavigationProp = NativeStackNavigationProp<TeamStackParamList>;
export type AuthStackNavigationProp = NativeStackNavigationProp<AuthStackParamList>;
export type MainTabNavigationProp = BottomTabNavigationProp<MainTabParamList>;
