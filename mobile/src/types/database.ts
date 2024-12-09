/**
 * Represents a JSON-compatible type for flexible data storage
 * @description Allows nested JSON structures with primitive and complex types
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Database schema definition for the Sport Connect application
 * @description Defines the structure of database tables and their relationships
 */
export type Database = {
  public: {
    Tables: {
      players: {
        /** Row representation of a player */
        Row: {
          created_at: string | null
          id: string
          jersey_number: string | null
          phone_number: string | null
          position: string
          stats: Json | null
          status: string | null
          team_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        /** Insert operation type for players table */
        Insert: {
          created_at?: string | null
          id?: string
          jersey_number?: string | null
          phone_number?: string | null
          position: string
          stats?: Json | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        /** Update operation type for players table */
        Update: {
          created_at?: string | null
          id?: string
          jersey_number?: string | null
          phone_number?: string | null
          position?: string
          stats?: Json | null
          status?: string | null
          team_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          owner_id: string | null
          created_at: string | null
          description: string
          id: string
          location: Json | null
          logo_url: string | null
          name: string
          players: string[] | null
          sport: string
          status: string | null
          team_code: string | null
          updated_at: string | null
        }
        Insert: {
          owner_id?: string | null
          created_at?: string | null
          description: string
          id?: string
          location?: Json | null
          logo_url?: string | null
          name: string
          players?: string[] | null
          sport: string
          status?: string | null
          team_code?: string | null
          updated_at?: string | null
        }
        Update: {
          owner_id?: string | null
          created_at?: string | null
          description?: string
          id?: string
          location?: Json | null
          logo_url?: string | null
          name?: string
          players?: string[] | null
          sport?: string
          status?: string | null
          team_code?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      tournaments: {
        Row: {
          created_at: string | null
          current_participants: string[] | null
          description: string
          end_date: string
          format: string
          id: string
          location: Json
          max_participants: number
          name: string
          organizer_id: string | null
          sport: string
          start_date: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_participants?: string[] | null
          description: string
          end_date: string
          format: string
          id?: string
          location: Json
          max_participants: number
          name: string
          organizer_id?: string | null
          sport: string
          start_date: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_participants?: string[] | null
          description?: string
          end_date?: string
          format?: string
          id?: string
          location?: Json
          max_participants?: number
          name?: string
          organizer_id?: string | null
          sport?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

/**
 * Represents a team status
 * @description Defines the possible statuses a team can have
 */
export type TeamStatus = 'active' | 'inactive';

/**
 * Represents a team in the Sport Connect application
 * @description Contains comprehensive information about a sports team
 */
export interface Team {
  id: string;
  name: string;
  description: string;
  sport: string;
  team_code: string;
  logo_url: string | null;
  owner_id: string;
  location: Json | null;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
  players: string[];
}

/**
 * Data Transfer Object for creating a new team
 * @description Defines the required and optional fields for team creation
 */
export interface CreateTeamRequest {
  name: string;
  description: string;
  sport: string;
  logo_url?: string | null;
  location?: Json | null;
  players?: string[];
  status?: TeamStatus;
}

/**
 * Represents a team update request
 * @description Defines the required and optional fields for team update
 */
export interface UpdateTeamRequest {
  name?: string;
  description?: string;
  sport?: string;
  logo_url?: string | null;
  location?: Json | null;
  players?: string[];
  status?: TeamStatus;
}

/**
 * Represents a team member in the Sport Connect application
 * @description Contains detailed information about a team member
 */
export interface TeamMember {
  /** Unique identifier for the team member */
  id: string;
  /** Identifier of the team the member belongs to */
  team_id: string;
  /** Identifier of the user associated with this team member */
  user_id: string;
  /** Role of the team member */
  role: 'player' | 'coach' | 'manager' | 'admin';
  /** Timestamp of when the member joined the team */
  joined_at: string;
  /** Timestamp of when the member left the team */
  left_at?: string;
}

export interface Player {
  id: string;
  user_id: string;
  team_id: string;
  username: string;
  position: string;
  jersey_number: string | null;
  phone_number: string | null;
  status: TeamStatus;
  stats: Json | null;
  created_at: string;
  updated_at: string;
}

export type TeamStaff = Omit<TeamMember, 'role'> & {
  role: 'manager' | 'coach'
}

export interface CreatePlayerRequest {
  userId: string;
  position: string;
  jerseyNumber?: string;
  phoneNumber?: string;
}

export interface UpdatePlayerRequest {
  position?: string;
  jerseyNumber?: string;
  phoneNumber?: string;
  status?: TeamStatus;
}

/**
 * Represents a team code
 * @description Contains team code information
 */
export interface TeamCode {
  teamId: string;
  teamCode: string;
  createdAt?: string;
}

/**
 * Represents a team that can be synced
 * @description Contains additional information for syncing teams
 */
export interface SyncableTeam extends Team {
  syncAttempts?: number;
  deleted?: boolean;
  lastSyncTimestamp?: number;
}

/**
 * Represents a team join request
 * @description Contains team join request information
 */
export type TeamJoinRequest = {
  team_id: string
  user_id: string
  role: TeamMember['role']
}
