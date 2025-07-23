export interface Database {
  public: {
    Tables: {
      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          sport: string;
          owner_id: string | null;
          logo_url: string | null;
          location: string | null;
          team_code: string | null;
          created_at: string;
          updated_at: string;
          status: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          sport: string;
          owner_id?: string | null;
          logo_url?: string | null;
          location?: string | null;
          team_code?: string | null;
          created_at?: string;
          updated_at?: string;
          status: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          sport?: string;
          owner_id?: string | null;
          logo_url?: string | null;
          location?: string | null;
          team_code?: string | null;
          created_at?: string;
          updated_at?: string;
          status?: string;
        };
      };
    };
  };
}