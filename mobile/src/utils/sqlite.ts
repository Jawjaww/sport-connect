import * as SQLite from 'expo-sqlite';
import { logger } from './logger';

// Types génériques pour la sécurité et la flexibilité
type SQLiteValue = string | number | null;
type SQLiteParams = SQLiteValue[];

// Interface pour les résultats de requête
interface QueryResult<T> {
  rows: T[];
  rowsAffected: number;
}

// Classe utilitaire pour les opérations SQLite sécurisées
class SQLiteHelper {
  private static db = SQLite.openDatabaseSync('sport_connect.db');

  /**
   * Exécute une requête SQL sécurisée
   * @param query Requête SQL avec des placeholders '?'
   * @param params Paramètres à insérer dans la requête
   * @returns Résultat de l'exécution de la requête
   */
  static execute(query: string, params: SQLiteParams = []): boolean {
    try {
      this.validateQuery(query, params);
      const statement = this.db.prepareSync(query);
      statement.executeSync(params);
      statement.finalizeSync();
      logger.debug('SQL Query executed successfully', { query, params });
      return true;
    } catch (error) {
      logger.error('SQLite Execution Error', { query, params, error });
      throw error;
    }
  }

  /**
   * Récupère le premier résultat d'une requête
   * @param query Requête SQL avec des placeholders '?'
   * @param params Paramètres à insérer dans la requête
   * @returns Premier résultat ou null
   */
  static findFirst<T = any>(query: string, params: SQLiteParams): T | null {
    try {
      this.validateQuery(query, params);
      const result = this.db.getFirstSync(query, params);
      return result as T;
    } catch (error) {
      logger.error('SQLite Find First Error', { query, params, error });
      return null;
    }
  }

  /**
   * Récupère tous les résultats d'une requête
   * @param query Requête SQL avec des placeholders '?'
   * @param params Paramètres à insérer dans la requête
   * @returns Tableau de résultats
   */
  static findAll<T = any>(query: string, params: SQLiteParams = []): QueryResult<T> {
    try {
      this.validateQuery(query, params);
      const result = this.db.getAllSync(query, params);
      return { rows: result as T[], rowsAffected: result.length };
    } catch (error) {
      logger.error('SQLite Find All Error', { query, params, error });
      return { rows: [], rowsAffected: 0 };
    }
  }

  /**
   * Validation de base des requêtes et paramètres
   * @param query Requête SQL
   * @param params Paramètres
   */
  private static validateQuery(query: string, params: SQLiteParams): void {
    if (!query) {
      throw new Error('Query cannot be empty');
    }

    // Vérification basique du nombre de placeholders
    const placeholderCount = (query.match(/\?/g) || []).length;
    if (placeholderCount !== params.length) {
      throw new Error(`Mismatch in query placeholders: expected ${placeholderCount}, got ${params.length}`);
    }

    // Validation des paramètres (exemple simple, à personnaliser)
    params.forEach(param => {
      if (param !== null && typeof param !== 'string' && typeof param !== 'number') {
        throw new Error('Invalid parameter type');
      }
    });
  }
}

// Fonctions d'export pour une utilisation simplifiée
export const runAsync = async (query: string, params: SQLiteParams = []): Promise<boolean> => {
  try {
    await SQLiteHelper.execute(query, params);
    return true;
  } catch (error) {
    console.error('Error in runAsync:', error);
    return false;
  }
};

export const getFirstAsync = <T = any>(query: string, params: SQLiteParams): T | null => 
  SQLiteHelper.findFirst<T>(query, params);

export const getAllAsync = <T = any>(query: string, params: SQLiteParams = []): QueryResult<T> => 
  SQLiteHelper.findAll<T>(query, params);

export const saveTeamCode = (teamId: string, teamCode: string): void => {
  runAsync(
    'INSERT OR REPLACE INTO team_codes (team_id, team_code, created_at) VALUES (?, ?, CURRENT_TIMESTAMP)', 
    [teamId, teamCode]
  );
};

export const getTeamCode = (teamId: string): string | null => {
  const result = getFirstAsync<{ team_code: string }>(
    'SELECT team_code FROM team_codes WHERE team_id = ?', 
    [teamId]
  );
  return result ? result.team_code : null;
};

// Initialisation des tables
try {
  runAsync(`
    CREATE TABLE IF NOT EXISTS teams (
      id TEXT PRIMARY KEY,
      name TEXT,
      description TEXT,
      sport TEXT,
      owner_id TEXT,
      created_at TEXT,
      updated_at TEXT,
      players TEXT,
      status TEXT,
      logo_url TEXT,
      location TEXT
    )
  `);

  runAsync(`
    CREATE TABLE IF NOT EXISTS team_codes (
      team_id TEXT PRIMARY KEY,
      team_code TEXT,
      created_at TEXT
    )
  `);

  logger.debug('Tables initialisées avec succès');
} catch (error) {
  logger.error('Erreur lors de l\'initialisation des tables', { error });
};
