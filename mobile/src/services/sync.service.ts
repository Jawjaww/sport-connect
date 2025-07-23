import { supabase } from './supabase';
import { logger } from '../utils/logger';
import { synchronize } from '@nozbe/watermelondb/sync';
import { database } from '../database/database';

class SyncService {
  private static instance: SyncService | null = null;

  private constructor() {}

  static getInstance(): SyncService {
    if (!this.instance) {
      this.instance = new SyncService();
    }
    return this.instance;
  }

  async synchronize(): Promise<void> {
    try {
      await synchronize({
        database,
        pullChanges: async ({ lastPulledAt }) => {
          const { data: teamsData, error: teamsError } = await supabase
            .from('teams')
            .select('*')
            .gt('updated_at', lastPulledAt || 0);

          if (teamsError) {
            logger.error('Error fetching teams from Supabase', { error: teamsError });
            throw teamsError;
          }

          const updatedTeams = teamsData.filter(team => team.updated_at > (lastPulledAt || 0));
          const deletedTeams: string[] = [];

          return {
            changes: {
              teams: {
                updated: updatedTeams,
                deleted: deletedTeams,
                created: teamsData
              }
            },
            timestamp: new Date().getTime()
          };
        },
        pushChanges: async ({ changes, lastPulledAt }) => {
          const { teams } = changes;

          if (teams.created?.length) {
            await supabase.from('teams').insert(teams.created);
          }
          if (teams.updated?.length) {
            for (const team of teams.updated) {
              await supabase
                .from('teams')
                .update(team)
                .eq('id', team.id);
            }
          }
          if (teams.deleted?.length) {
            await supabase
              .from('teams')
              .delete()
              .in('id', teams.deleted);
          }
        }
      });
      logger.info('Synchronization completed successfully');
    } catch (error) {
      logger.error('Error during synchronization', { error });
      throw error;
    }
  }
}

export const syncService = SyncService.getInstance();