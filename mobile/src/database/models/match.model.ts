import { Model } from '@nozbe/watermelondb';
import { field, date, json, readonly, text } from '@nozbe/watermelondb/decorators';
import { tableSchema } from '@nozbe/watermelondb/Schema';
import type { Match as MatchType } from '../../types';
import { Associations } from '@nozbe/watermelondb/Model';

export default class Match extends Model implements MatchType {
  static table = 'matches';
  static associations: Associations = {
    teams: { type: 'belongs_to' as const, key: 'team_id' },
  };

  @text('team_id') team_id!: string;
  @text('opponent') opponent!: string;
  @date('date') date!: Date;
  @text('location') location?: string;
  @json('score', (rawScore: any) => {
    if (!rawScore) return undefined;
    if (typeof rawScore === 'string') {
      try {
        return JSON.parse(rawScore);
      } catch {
        return undefined;
      }
    }
    return rawScore;
  }) score?: { home: number; away: number };
  @text('status') status!: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
