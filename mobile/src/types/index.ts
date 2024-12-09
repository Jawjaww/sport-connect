import type { Json } from './database';

export type { Database } from './database.types';
export type {
  Json,
  Team,
  TeamStatus,
  CreateTeamRequest,
  UpdateTeamRequest,
  Player,
  CreatePlayerRequest,
  UpdatePlayerRequest,
  TeamMember,
  SyncableTeam,
  TeamJoinRequest
} from './database';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}

// Navigation Types
export * from './navigation';

export interface RootStackParamList {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  PlayerProfile: { playerId: string };
  Team: undefined;
  CreateTeam: undefined;
  JoinTeam: undefined;
  TeamMembers: { teamId: string };
  EditTeam: { teamId: string };
  EditPlayer: { playerId: string; teamId: string };
  AddPlayer: undefined;
  TournamentDetails: { tournamentId: string };
  [key: string]: undefined | object;
}

export interface AuthStackParamList {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  CreateProfile: undefined;
  [key: string]: undefined | object;
}

export interface MainTabParamList {
  HomeMain: undefined;
  TeamMain: undefined;
  Tournaments: undefined;
  Statistics: undefined;
  Notifications: undefined;
  Settings: undefined;
  [key: string]: undefined | object;
}

export type HomeStackParamList = {
  HomeMain: undefined;
  MatchDetails: { matchId: string };
  TournamentDetails: { tournamentId: string };
};

export type TeamStackParamList = {
  TeamMain: undefined;
  JoinTeam: undefined;
  CreateTeam: undefined;
  EditTeam: { teamId: string };
  PlayerDetails: { playerId: string };
  EditPlayer: { playerId: string; teamId: string };
  EditProfile: undefined;
  TeamSettings: { teamId: string };
  TeamMembers: { teamId: string };
  AddPlayer: undefined;
  TeamCode: { teamId: string; teamCode: string };
};

export type TournamentsStackParamList = {
  TournamentsMain: undefined;
  TournamentDetails: { tournamentId: string };
  CreateTournament: undefined;
};

export type StatisticsStackParamList = {  
  StatisticsMain: undefined;
  PlayerProfile: { playerId: string };
  TeamProfile: { teamId: string };
  [key: string]: undefined | object;
};
