import * as SQLite from 'expo-sqlite';
import { logger } from '../utils/logger';
import * as FileSystem from 'expo-file-system';

class DatabaseService {
  private static instance: DatabaseService;
  private database: SQLite.SQLiteDatabase;

  private constructor() {
    this.database = SQLite.openDatabaseSync('sport_connect.db');
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  public async resetDatabase(): Promise<void> {
    try {
      this.database.closeSync();

      const dbPath = `${FileSystem.documentDirectory}SQLite/sport_connect.db`;
      
      const fileInfo = await FileSystem.getInfoAsync(dbPath);
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(dbPath);
        logger.info('Ancienne base de données supprimée avec succès');
      }

      this.database = SQLite.openDatabaseSync('sport_connect.db');

      this.initialize();
    } catch (error) {
      logger.error('Erreur lors de la réinitialisation de la base de données', { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public initialize(): void {
    try {
      logger.info('Initializing database...');
      
      this.database.execSync(`
        -- Table teams (identique à Supabase)
        CREATE TABLE IF NOT EXISTS teams (
          id UUID PRIMARY KEY,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          name TEXT NOT NULL,
          description TEXT,
          sport TEXT,
          owner_id UUID,
          logo_url TEXT,
          location TEXT
        );

        -- Table team_members (identique à Supabase)
        CREATE TABLE IF NOT EXISTS team_members (
          id UUID PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          team_id UUID,
          user_id UUID,
          role TEXT CHECK (role IN ('player', 'coach', 'manager', 'admin')) NOT NULL,
          joined_at TIMESTAMPTZ NOT NULL,
          left_at TIMESTAMPTZ,
          status TEXT CHECK (status IN ('active', 'inactive')) DEFAULT 'active',
          FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
          UNIQUE(team_id, user_id)
        );

        -- Table team_codes (identique à Supabase)
        CREATE TABLE IF NOT EXISTS team_codes (
          team_id UUID PRIMARY KEY,
          code TEXT NOT NULL UNIQUE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE
        );

        -- Index pour améliorer les performances
        CREATE INDEX IF NOT EXISTS idx_team_codes_code ON team_codes(code);

        -- Table matches (identique à Supabase)
        CREATE TABLE IF NOT EXISTS matches (
          id UUID PRIMARY KEY,
          home_team_id UUID NOT NULL,
          away_team_id UUID NOT NULL,
          match_date TIMESTAMPTZ NOT NULL,
          location TEXT,
          home_team_score INTEGER,
          away_team_score INTEGER,
          status TEXT CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')) DEFAULT 'scheduled',
          FOREIGN KEY(home_team_id) REFERENCES teams(id) ON DELETE CASCADE,
          FOREIGN KEY(away_team_id) REFERENCES teams(id) ON DELETE CASCADE
        );
      `);

      logger.info('Database initialization completed');
    } catch (error) {
      logger.error('Failed to initialize database', { 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public getDatabase(): SQLite.SQLiteDatabase {
    return this.database;
  }

  public createTeam(team: {
    id: string;
    name: string;
    description?: string;
    sport?: string;
    owner_id: string;
    logo_url?: string;
    location?: string;
  }): void {
    const query = `
      INSERT INTO teams 
      (id, name, description, sport, owner_id, logo_url, location) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      this.database.runSync(query, [
        team.id, 
        team.name, 
        team.description || null,
        team.sport || null,
        team.owner_id,
        team.logo_url || null,
        team.location || null
      ]);
    } catch (error) {
      logger.error('Error creating team', { 
        query, 
        team,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public createTeamCode(teamCode: {
    team_id: string;
    code: string;
  }): void {
    const query = `
      INSERT INTO team_codes 
      (team_id, code) 
      VALUES (?, ?)
    `;

    try {
      this.database.runSync(query, [
        teamCode.team_id, 
        teamCode.code
      ]);
    } catch (error) {
      logger.error('Error creating team code', { 
        query, 
        teamCode,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public createTeamMember(teamMember: {
    team_id: string;
    user_id: string;
    role: 'player' | 'coach' | 'manager' | 'admin';
  }): void {
    const query = `
      INSERT INTO team_members 
      (team_id, user_id, role, joined_at) 
      VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `;

    try {
      this.database.runSync(query, [
        teamMember.team_id, 
        teamMember.user_id, 
        teamMember.role
      ]);
    } catch (error) {
      logger.error('Error creating team member', { 
        query, 
        teamMember,
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public createMatch(match: {
    id: string,
    home_team_id: string;
    away_team_id: string;
    match_date: string;
    location?: string;
    home_team_score?: number;
    away_team_score?: number;
    status?: string
  }): void {
    const query = `
      INSERT INTO matches 
      (id, home_team_id, away_team_id, match_date, location, home_team_score, away_team_score, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    try {
      this.database.runSync(
        query,
        [
          match.id, 
          match.home_team_id, 
          match.away_team_id, 
          match.match_date,
          match.location || null,
          match.home_team_score || null,
          match.away_team_score || null,
          match.status || 'scheduled'
        ]
      );
    } catch (error) {
      logger.error('Error creating match', { 
        query, 
        params: [
          match.id, 
          match.home_team_id, 
          match.away_team_id, 
          match.match_date,
          match.location || null,
          match.home_team_score || null,
          match.away_team_score || null,
          match.status || 'scheduled'
        ],
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public runQuery(query: string, params: any[] = []): void {
    try {
      this.database.runSync(query, params);
    } catch (error) {
      logger.error('Query execution failed', { 
        query, 
        params, 
        error: error instanceof Error ? error.message : error 
      });
      throw error;
    }
  }

  public getFirst<T>(query: string, params: any[] = []): T | null {
    try {
      const result = this.database.getFirstSync<T>(query, params);
      return result;
    } catch (error) {
      logger.error('Get first result failed', { 
        query, 
        params, 
        error: error instanceof Error ? error.message : error 
      });
      return null;
    }
  }

  public getAll<T>(query: string, params: any[] = []): T[] {
    try {
      const results = this.database.getAllSync<T>(query, params);
      return results;
    } catch (error) {
      logger.error('Get all results failed', { 
        query, 
        params, 
        error: error instanceof Error ? error.message : error 
      });
      return [];
    }
  }
}

export const databaseService = DatabaseService.getInstance();
