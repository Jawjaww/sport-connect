import * as SQLite from 'expo-sqlite';

interface SQLResultSet {
  rows: any[];
}

interface SQLError {
  message: string;
}

// Nouvelle API SQLite pour Expo SDK 52+
const db = SQLite.openDatabaseSync('sportconnect.db');

export const SQLiteService = {
  runAsync: async (query: string, params: any[] = []): Promise<void> => {
    try {
      await db.execAsync(`PRAGMA journal_mode = WAL;`);
      await db.runAsync(query, ...params);
    } catch (error) {
      throw new Error(`SQLite runAsync error: ${error}`);
    }
  },

  getAllAsync: async (table: string): Promise<any[]> => {
    try {
      const result = await db.getAllAsync(`SELECT * FROM ${table}`);
      return result;
    } catch (error) {
      throw new Error(`SQLite getAllAsync error: ${error}`);
    }
  },

  saveTeamCode: async (teamId: string, code: string): Promise<void> => {
    return SQLiteService.runAsync(
      'INSERT OR REPLACE INTO team_codes (team_id, code) VALUES (?, ?)',
      [teamId, code]
    );
  },

  getTeamCode: async (teamId: string): Promise<string | null> => {
    try {
      const result = await db.getFirstAsync(
        'SELECT code FROM team_codes WHERE team_id = ?', 
        teamId
      ) as { code: string } | null;
      return result?.code || null;
    } catch (error) {
      throw new Error(`SQLite getTeamCode error: ${error}`);
    }
  }
};
