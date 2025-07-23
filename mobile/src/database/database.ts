import { Database } from '@nozbe/watermelondb'
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite'
import schema from './schema'
import Team from './models/team.model'
import TeamCode from './models/team-code.model'
import { logger } from '../utils/logger'
import { schemaMigrations } from '@nozbe/watermelondb/Schema/migrations'

const adapter = new SQLiteAdapter({
  schema,
  // Optional database name
  dbName: 'sportConnectDB',
  // Optional migrations
  migrations: schemaMigrations({
    migrations: [
      {
        toVersion: 2,
        steps: []
      }
    ]
  }),
  // Optional logging
  onSetUpError: error => {
    logger.error('Database setup error:', error)
  }
})

export const database = new Database({
  adapter,
  modelClasses: [
    Team,
    TeamCode
  ]
})
