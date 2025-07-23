import { NativeStackScreenProps } from '@react-navigation/native-stack';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export interface User {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
}

export interface Profile {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  phone_number?: string;
  birth_date?: Date;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'player' | 'coach' | 'manager' | 'admin';
  joined_at: Date;
  left_at: Date | null;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  sport: string;
  owner_id: string | null;
  players?: string[];
  logo_url?: string;
  location?: string;
  team_code?: string;
  created_at: Date;
  updated_at: Date;
  status: string;
}

export interface CreateTeamRequest {
  name: string;
  description?: string;
  sport: string;
  owner_id: string;
  status: string;
  logo_url?: string;
  location?: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  sport?: string;
  status?: string;
  logo_url?: string;
  location?: string;
}

export interface TeamResponse {
  data: Team[] | null;
  error: string | null;
}

export interface TeamCodeResponse {
  data: string | null;
  error: string | null;
}

export interface ShareTeamCodeResponse {
  teamCode: string | null;
  shareLink: string | null;
  error: string | null;
}

export interface PlayerStats {
  matches_played: number;
  games_played: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
  average_rating?: number;
}

export interface Match {
  id: string;
  team_id: string;
  opponent: string;
  location: string;
  date: Date;
  result?: string;
  scoreA?: number;
  scoreB?: number;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface Tournament {
  id: string;
  name: string;
  description?: string;
  start_date: Date;
  end_date: Date;
  location?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  created_at: Date;
  updated_at: Date;
}

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  avatar_url?: string;
  access_token: string;
  refresh_token: string;
}

export interface Player {
  id: string;
  team_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: 'player' | 'coach' | 'manager' | 'admin';
  phone_number?: string;
  position?: string;
  jersey_number?: string;
  stats?: PlayerStats;
  avatar_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface TeamCode {
  code: string;
  team_id: string;
  created_at: Date;
  expires_at: Date;
  is_active: boolean;
}

export interface TeamCodeComponentProps {
  teamId: string;
  mode: 'view' | 'edit' | 'dialog';
}

export interface CreatePlayerRequest {
  name: string;
  position?: string;
  number?: string;
  status?: 'active' | 'inactive';
}

export interface UpdatePlayerRequest extends Partial<CreatePlayerRequest> {
  id: string;
  name: string;
}

export interface JoinTeamRequest {
  teamId: string;
  code: string;
}

export interface ProcessJoinRequestParams {
  teamId: string;
  userId: string;
  status: 'accepted' | 'rejected';
}

export interface TeamCodeComponentProps {
  teamId: string;
  mode: 'view' | 'edit' | 'dialog';
}

export type TeamStackParamList = {
  TeamMain: { teamId: string };
  CreateTeam: undefined;
  TeamMembers: { teamId: string };
  TeamSettings: { teamId: string };
  EditPlayer: { playerId: string; teamId: string };
  TeamCodeDetail: { teamId: string; teamCode: string };
  JoinTeam: undefined;
};
