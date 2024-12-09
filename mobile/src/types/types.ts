import type { ParamListBase } from '@react-navigation/native';
import type { Database } from './database.types';

// Base types from Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Team related types
export type TeamRow = Database['public']['Tables']['teams']['Row'];
export type TeamInsert = Database['public']['Tables']['teams']['Insert'];
export type TeamUpdate = Database['public']['Tables']['teams']['Update'];

export const TeamStatusEnum = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DELETED: 'deleted'
} as const;

export type TeamStatus = typeof TeamStatusEnum[keyof typeof TeamStatusEnum];

export interface Team extends Omit<TeamRow, 'players'> {
  players?: string[];
  team_code: string;
}

export interface CreateTeamRequest extends Omit<TeamInsert, 'id' | 'created_at' | 'updated_at' | 'owner_id'> {
  name: string;
  description: string;
  sport: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  sport?: string;
  status?: TeamStatus;
}

export interface TeamMember {
  id: string;
  user_id: string;
  team_id: string;
  role: 'player' | 'coach' | 'manager' | 'admin';
  joined_at: string;
  left_at?: string;
}

export interface TeamJoinRequest {
  id: string;
  team_id: string;
  user_id: string;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
  updated_at: string;
}

export interface TeamResponse {
  data?: Team;
  error?: any;
}

export interface SyncableTeam extends Team {
  syncAttempts: number;
  deleted: boolean;
  lastSyncTimestamp: number;
}

// Player related types
export type PlayerRow = Database['public']['Tables']['players']['Row'];
export type PlayerInsert = Database['public']['Tables']['players']['Insert'];
export type PlayerUpdate = Database['public']['Tables']['players']['Update'];

export type PlayerStatus = PlayerRow['status'];

export interface PlayerStats {
  id: string;
  player_id: string;
  team_id: string;
  games_played: number;
  goals: number;
  assists: number;
  minutes_played: number;
  yellow_cards: number;
  red_cards: number;
  performance_score?: number;
  created_at: string;
  updated_at: string;
}

export interface PlayerRating {
  id: string;
  player_id: string;
  match_id: string;
  rating: number;
  created_at: string;
}

export interface Player extends Omit<PlayerRow, 'stats'> {
  id: string;
  username: string;
  position: string;
  stats?: PlayerStats;
  teams?: TeamMember[];
  ratings?: PlayerRating[];
}

// Tournament related types
export interface Match {
  id: string;
  home_team: Team;
  away_team: Team;
  date: string;
  venue?: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
}

export interface Tournament {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  status: 'upcoming' | 'in_progress' | 'completed';
  teams: Team[];
  format: 'league' | 'knockout' | 'group_stage';
  groups?: TournamentGroup[];
  location?: string;
  description?: string;
  participantsCount?: number;
}

export interface TournamentGroup {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}

// Navigation types
export interface RootStackParamList {
  Auth: undefined;
  Home: undefined;
  Team: { teamId: string };
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
}

export interface AuthStackParamList {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token: string };
}

export interface MainTabParamList {
  HomeMain: undefined;
  TeamMain: undefined;
  Tournaments: undefined;
  Statistics: undefined;
  Notifications: undefined;
  Settings: undefined;
}

export interface HomeStackParamList {
  HomeMain: undefined;
  MatchDetails: { matchId: string };
  TournamentDetails: { tournamentId: string };
  TeamCreation: undefined;
  TeamCode: { teamId: string; teamCode: string; isNewTeam?: boolean };
  Profile: undefined;
}

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
  HomeMain: undefined;
  [key: string]: undefined | object;
}

// Notification types
export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'match' | 'tournament' | 'team' | 'performance';
  read: boolean;
  created_at: string;
}

// User types
export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  created_at: string;
}
