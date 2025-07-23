import { Model } from '@nozbe/watermelondb';
import { field, date, json, readonly, text } from '@nozbe/watermelondb/decorators';
import { tableSchema } from '@nozbe/watermelondb/Schema';
import type { Tournament as TournamentType } from '../../types';

export default class Tournament extends Model implements TournamentType {
  static table = 'tournaments';

  @text('name') name!: string;
  @date('start_date') start_date!: Date;
  @date('end_date') end_date!: Date;
  @text('location') location?: string;
  @json('teams', (rawTeams: any) => {
    if (!rawTeams) return [];
    if (typeof rawTeams === 'string') {
      try {
        return JSON.parse(rawTeams);
      } catch {
        return [];
      }
    }
    return Array.isArray(rawTeams) ? rawTeams : [];
  }) teams!: string[];
  @text('status') status!: 'upcoming' | 'in_progress' | 'completed';

  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
