import { database } from '../database/database'
import { logger } from '../utils/logger'
import { syncService } from './sync.service'

interface InitResult {
  initService: InitService;
  cleanup: () => void;
}

export class InitService {
  private static instance: InitService | null = null;
  private syncService: typeof syncService;

  private constructor() {
    this.syncService = syncService;
  }

  public static getInstance(): InitService {
    if (!InitService.instance) {
      InitService.instance = new InitService();
    }
    return InitService.instance;
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Starting app initialization...');

      // Initialize database
      await database.write(async () => {
        logger.info('Database initialized successfully');
      });

      // Setup initial sync
      await this.syncService.synchronize();

      logger.info('App initialization completed successfully');
    } catch (error) {
      logger.error('Error during app initialization', { error });
      throw error;
    }
  }
}

export const initApp = async (): Promise<InitResult> => {
  console.log('Starting app initialization...');
  const initService = InitService.getInstance();
  console.log('Initializing app...');
  await initService.initialize();
  console.log('Initialization complete.');

  const cleanup = () => {
    console.log('Cleaning up...');
    // Add cleanup logic here if needed
  };

  return { initService, cleanup };
};
