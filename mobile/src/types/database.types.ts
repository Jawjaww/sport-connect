export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          username: string
          full_name: string | null
          avatar_url: string | null
          sports: string[]
          location: Json | null
          bio: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          sports?: string[]
          location?: Json | null
          bio?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          sports?: string[]
          location?: Json | null
          bio?: string | null
        }
      }
      players: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          team_id: string
          user_id: string
          position: string
          jersey_number: string
          phone_number: string
          status: 'active' | 'inactive' | 'injured'
          stats: PlayerStats
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          team_id: string
          user_id: string
          position: string
          jersey_number?: string
          phone_number?: string
          status?: 'active' | 'inactive' | 'injured'
          stats?: PlayerStats
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          team_id?: string
          user_id?: string
          position?: string
          jersey_number?: string
          phone_number?: string
          status?: 'active' | 'inactive' | 'injured'
          stats?: PlayerStats
        }
      }
      teams: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          sport: string
          logo_url: string | null
          owner_id: string
          players: string[]
          location: Json | null
          status: 'active' | 'inactive'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          sport: string
          logo_url?: string | null
          owner_id: string
          players?: string[]
          location?: Json | null
          status?: 'active' | 'inactive'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          sport?: string
          logo_url?: string | null
          owner_id?: string
          players?: string[]
          location?: Json | null
          status?: 'active' | 'inactive'
        }
      }
      tournaments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string
          sport: string
          start_date: string
          end_date: string
          location: Json
          organizer_id: string
          max_teams: number
          registered_teams: string[]
          status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          format: 'knockout' | 'league' | 'groups'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description: string
          sport: string
          start_date: string
          end_date: string
          location: Json
          organizer_id: string
          max_teams: number
          registered_teams?: string[]
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          format: 'knockout' | 'league' | 'groups'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string
          sport?: string
          start_date?: string
          end_date?: string
          location?: Json
          organizer_id?: string
          max_teams?: number
          registered_teams?: string[]
          status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
          format?: 'knockout' | 'league' | 'groups'
        }
      }
      events: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          sport: string
          date: string
          location: Json
          creator_id: string
          max_participants: number
          current_participants: string[]
          status: 'open' | 'full' | 'cancelled' | 'completed'
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          sport: string
          date: string
          location: Json
          creator_id: string
          max_participants: number
          current_participants?: string[]
          status?: 'open' | 'full' | 'cancelled' | 'completed'
          skill_level: 'beginner' | 'intermediate' | 'advanced' | 'all'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          sport?: string
          date?: string
          location?: Json
          creator_id?: string
          max_participants?: number
          current_participants?: string[]
          status?: 'open' | 'full' | 'cancelled' | 'completed'
          skill_level?: 'beginner' | 'intermediate' | 'advanced' | 'all'
        }
      }
      chats: {
        Row: {
          id: string
          created_at: string
          event_id: string
          user_id: string
          message: string
          type: 'text' | 'image'
        }
        Insert: {
          id?: string
          created_at?: string
          event_id: string
          user_id: string
          message: string
          type?: 'text' | 'image'
        }
        Update: {
          id?: string
          created_at?: string
          event_id?: string
          user_id?: string
          message?: string
          type?: 'text' | 'image'
        }
      }
      notifications: {
        Row: {
          id: string
          created_at: string
          user_id: string
          type: 'event_invitation' | 'event_update' | 'chat_message' | 'event_reminder'
          content: Json
          read: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          type: 'event_invitation' | 'event_update' | 'chat_message' | 'event_reminder'
          content: Json
          read?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          type?: 'event_invitation' | 'event_update' | 'chat_message' | 'event_reminder'
          content?: Json
          read?: boolean
        }
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
  }
}

export interface PlayerStats {
  games_played: number
  goals: number
  assists: number
  minutes_played: number
  yellow_cards: number
  red_cards: number
  ratings: number[]
  last_updated: string
}
