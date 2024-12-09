import type { Database } from './database.types';

export type TeamCode = string;

export enum TeamStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

// Base type from Supabase
type TeamRow = Database['public']['Tables']['teams']['Row'];
type TeamInsert = Database['public']['Tables']['teams']['Insert'];
type TeamUpdate = Database['public']['Tables']['teams']['Update'];

// Extended Team type with additional fields
export interface Team extends TeamRow {
  players: string[];
}

// Request DTOs
export interface CreateTeamRequest extends Omit<TeamInsert, 'id' | 'created_at' | 'updated_at' | 'owner_id' | 'team_code'> {
  name: string;
  description: string;
  sport: string;
}

export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  sport?: string;
  status?: TeamStatus;
  // Add other fields as necessary, ensuring they are optional if not required for an update
}

// Team member related types
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

// Response type for team operations
export interface TeamResponse {
  data?: Team;
  error?: any;
}

// Type for local storage and sync
export interface SyncableTeam extends Team {
  syncAttempts: number;
  deleted: boolean;
  lastSyncTimestamp: number;
}
