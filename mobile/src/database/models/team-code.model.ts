import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text, relation } from '@nozbe/watermelondb/decorators';
import { tableSchema } from '@nozbe/watermelondb/Schema';
import { Associations } from '@nozbe/watermelondb/Model';
import { Relation } from '@nozbe/watermelondb';
import Team from './team.model';

export const teamCodeSchema = tableSchema({
  name: 'team_codes',
  columns: [
    { name: 'team_id', type: 'string' },
    { name: 'code', type: 'string' },
    { name: 'status', type: 'string' },
    { name: 'expiration_date', type: 'number' },
    { name: 'created_at', type: 'number' },
    { name: 'updated_at', type: 'number' },
  ],
});

export default class TeamCode extends Model {
  static table = 'team_codes';
  static associations: Associations = {
    teams: { type: 'belongs_to' as const, key: 'team_id' },
  };

  @text('team_id') team_id!: string;
  @text('code') code!: string;
  @text('status') status!: 'active' | 'used' | 'expired';
  @date('expiration_date') expiration_date!: Date;
  
  @relation('teams', 'team_id') team!: Relation<Team>;
  
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
