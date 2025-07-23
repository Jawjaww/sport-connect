import { appSchema, tableSchema } from '@nozbe/watermelondb';

export default appSchema({
  version: 1,
  tables: [
    tableSchema({
      name: 'teams',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'description', type: 'string', isOptional: true },
        { name: 'sport', type: 'string' },
        { name: 'owner_id', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
        { name: 'players', type: 'string' }, // JSON stringified array
        { name: 'status', type: 'string' },
        { name: 'logo_url', type: 'string', isOptional: true },
        { name: 'location', type: 'string', isOptional: true },
      ]
    }),
    tableSchema({
      name: 'team_codes',
      columns: [
        { name: 'team_id', type: 'string', isIndexed: true },
        { name: 'code', type: 'string' },
        { name: 'status', type: 'string' },
        { name: 'expiration_date', type: 'number' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'matches',
      columns: [
        { name: 'team_id', type: 'string', isIndexed: true },
        { name: 'opponent', type: 'string' },
        { name: 'date', type: 'number' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'score', type: 'string', isOptional: true }, // JSON stringified
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    }),
    tableSchema({
      name: 'tournaments',
      columns: [
        { name: 'name', type: 'string' },
        { name: 'start_date', type: 'number' },
        { name: 'end_date', type: 'number' },
        { name: 'location', type: 'string', isOptional: true },
        { name: 'teams', type: 'string' }, // JSON stringified array
        { name: 'status', type: 'string' },
        { name: 'created_at', type: 'number' },
        { name: 'updated_at', type: 'number' },
      ]
    })
  ]
});
