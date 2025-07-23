import { Model } from '@nozbe/watermelondb'
import { field, date, readonly, json } from '@nozbe/watermelondb/decorators'

export default class Team extends Model {
  static table = 'teams'

  @field('name') name!: string
  @field('description') description?: string
  @field('sport') sport!: string
  @field('owner_id') owner_id!: string
  @readonly @date('created_at') created_at!: Date
  @readonly @date('updated_at') updated_at!: Date
  @json('players', (rawPlayers: any) => {
    if (!rawPlayers) return [];
    if (typeof rawPlayers === 'string') {
      try {
        return JSON.parse(rawPlayers);
      } catch {
        return [];
      }
    }
    return Array.isArray(rawPlayers) ? rawPlayers : [];
  }) players!: string[]
  @field('status') status!: string
  @field('logo_url') logo_url?: string
  @field('location') location?: string
  @field('synced') synced!: boolean
  @field('code') code!: string;
}
