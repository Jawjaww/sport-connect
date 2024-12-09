export interface User {
  id: string;
  email: string;
  username: string;
  role: 'admin' | 'player' | 'coach' | 'spectator';
  avatar_url?: string;
  created_at: string;
}

export interface Team {
  id: string;
  name: string;
  logo_url?: string;
  created_by: string;
  created_at: string;
  players: Player[];
}

export interface Player extends User {
  team_id?: string;
  position: string;
  stats: PlayerStats;
}

export interface PlayerStats {
  matches_played: number;
  average_rating: number;
  goals?: number;
  assists?: number;
  performance_score: number;
}

export interface Match {
  id: string;
  home_team: Team;
  away_team: Team;
  date: string;
  location: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  score?: {
    home: number;
    away: number;
  };
  tournament_id?: string;
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
}

export interface TournamentGroup {
  id: string;
  name: string;
  teams: Team[];
  matches: Match[];
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'match' | 'tournament' | 'team' | 'performance';
  read: boolean;
  created_at: string;
}

export interface PlayerRating {
  id: string;
  match_id: string;
  player_id: string;
  rated_by: string;
  rating: number;
  comments?: string;
  created_at: string;
}
