import { pgTable, uuid, varchar, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'

// Audit Logs
export const auditLogs = pgTable('audit_logs', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    action: varchar('action', { length: 100 }).notNull(),
    resource: varchar('resource', { length: 100 }).notNull(),
    before: jsonb('before'),
    after: jsonb('after'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations are defined in relations.ts to avoid circular dependencies
