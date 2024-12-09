import { supabase } from './supabase';
import { runAsync, getFirstAsync, getAllAsync } from '../utils/sqlite';
import type { Team, CreateTeamRequest, SyncableTeam } from '../types';
import * as Network from 'expo-network';
import * as Sharing from 'expo-sharing';
import * as Clipboard from 'expo-clipboard';
import { Alert } from 'react-native';
import { v4 as uuidv4 } from 'uuid';
import * as SQLite from 'expo-sqlite';

export class SyncService {
  private static instance: SyncService;
  private syncQueue: SyncableTeam[] = [];
  private syncInterval!: NodeJS.Timeout;

  static readonly SYNC_INTERVAL = 30000; // 30 secondes
  static readonly MAX_SYNC_ATTEMPTS = 3;

  private constructor() {
    this.initializeSyncInterval();
  }

  public static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  private initializeSyncInterval(): void {
    this.syncInterval = setInterval(
      () => this.processSyncQueue(), 
      SyncService.SYNC_INTERVAL
    );
  }

  public queueForSync(team: SyncableTeam): void {
    const existingTeamIndex = this.syncQueue.findIndex(t => t.id === team.id);
    
    const syncableTeam: SyncableTeam = {
      ...team,
      syncAttempts: 0,
      lastSyncTimestamp: Date.now()
    };

    if (existingTeamIndex !== -1) {
      this.syncQueue[existingTeamIndex] = {
        ...this.syncQueue[existingTeamIndex],
        ...syncableTeam
      };
    } else {
      this.syncQueue.push(syncableTeam);
    }
  }

  private async processSyncQueue(): Promise<void> {
    try {
      const networkState = await Network.getNetworkStateAsync();
      if (!networkState.isConnected) return;

      const itemsToSync = this.syncQueue.splice(0, 5);

      for (const team of itemsToSync) {
        try {
          if (team.deleted) {
            await this.deleteTeam(team);
          } else {
            await this.upsertTeam(team);
          }

          // Broadcast an event to notify listeners about sync completion
          const event = { type: 'teamSynced', detail: team };
          (globalThis as any).dispatchEvent(event);
        } catch (error) {
          this.handleSyncError(team, error);
        }
      }
    } catch (error) {
      console.error('Sync queue processing error:', error);
    }
  }

  private async deleteTeam(team: SyncableTeam): Promise<void> {
    await supabase.from('teams').delete().eq('id', team.id);
  }

  private async upsertTeam(team: SyncableTeam): Promise<void> {
    const { data, error } = await supabase.from('teams').upsert(
      [team], 
      { 
        onConflict: 'id',
        defaultToNull: false 
      }
    );

    if (error) {
      console.error('Upsert team error:', error);
      throw error;
    }

    // Trigger a local database update
    await this.updateLocalDatabase(team);
  }

  private async updateLocalDatabase(team: SyncableTeam): Promise<void> {
    const db = SQLite.openDatabaseSync('sportconnect.db');
    try {
      await db.runAsync(
        'INSERT INTO teams (id, name, description, sport, team_code, created_at, owner_id, players, status, updated_at, logo_url, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
          team.id,
          team.name,
          team.description || '',
          team.sport,
          team.team_code || '',
          team.created_at || '',
          team.owner_id || '',
          JSON.stringify(team.players) || '[]',
          team.status || '',
          team.updated_at || '',
          team.logo_url || '',
          JSON.stringify(team.location) || '{}',
        ]
      );
    } catch (error) {
      console.error('Error updating local database:', error);
    }
  }

  private handleSyncError(team: SyncableTeam, error: unknown): void {
    const attempts = (team.syncAttempts || 0) + 1;
    
    console.warn(`Sync failed for team ${team.id}:`, error);
    
    if (attempts < SyncService.MAX_SYNC_ATTEMPTS) {
      team.syncAttempts = attempts;
      this.syncQueue.push(team);
    }
  }

  public async shareTeamCode(teamCode: string): Promise<void> {
    try {
      const shareLink = `sportconnect://join-team/${teamCode}`;

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(shareLink, {
          dialogTitle: 'Partager le code d\'équipe',
          mimeType: 'text/plain'
        });
      } else {
        await Clipboard.setStringAsync(shareLink);
        Alert.alert(
          'Lien copié', 
          'Le lien de partage a été copié dans le presse-papiers.'
        );
      }
    } catch (error) {
      console.error('Team Code Sharing Error:', error);
      Alert.alert('Erreur', 'Impossible de partager le code d\'équipe');
    }
  }

  public stopSync(): void {
    clearInterval(this.syncInterval);
  }

  public clearSyncQueue(): void {
    this.syncQueue = [];
  }

  public getSyncQueueLength(): number {
    return this.syncQueue.length;
  }
}

export const syncService = SyncService.getInstance();