import { useEffect, useState } from 'react';
import { databaseService } from '../services/database.service';
import { logger } from '../utils/logger';

export const useDatabase = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initDb = async () => {
      try {
        // Réinitialiser complètement la base de données
        await databaseService.resetDatabase();
        setIsInitialized(true);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown database initialization error';
        logger.error('Failed to reset and initialize database:', { error: errorMessage });
        setError(error instanceof Error ? error : new Error(errorMessage));
      }
    };

    initDb();
  }, []);

  return { isInitialized, error };
};
