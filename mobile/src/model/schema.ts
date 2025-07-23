import { appSchema, tableSchema } from '@nozbe/watermelondb';

export const schema = appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'teams',
      columns: [
        { name: 'id', type: 'string' },
        { name: 'created_at', type: 'string' },
        { name: 'updated_at', type: 'string' },
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'sport', type: 'string', isOptional: true },
        { name: 'logo_url', type: 'string', isOptional: true },
        { name: 'owner_id', type: 'string' },
        { name: 'players', type: 'string', isOptional: true },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'status', type: 'string', isOptional: true },
        { name: 'team_code', type: 'string', isOptional: true },
        { name: 'syncAttempts', type: 'number' },
        { name: 'deleted', type: 'boolean' },
        { name: 'lastSyncTimestamp', type: 'number' }
      ]
    }),
    tableSchema({
      name: 'team_codes',
      columns: [
        { name: 'team_id', type: 'string' },
        { name: 'team_code', type: 'string', isOptional: true },
        { name: 'created_at', type: 'string' }
      ]
    })
  ]
});
