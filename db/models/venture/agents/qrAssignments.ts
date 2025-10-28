import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { users } from '../../shared/user'
import { agents } from './agents'

// QR Assignments table - tracks which agent gets which range of codes
export const qrAssignments = pgTable('qr_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  assignedBy: uuid('assigned_by').notNull().references(() => users.id, { onDelete: 'cascade' }),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  rangeStart: text('range_start').notNull(),     // 'TJW0001'
  rangeEnd: text('range_end').notNull(),         // 'TJW0100'
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations are defined in relations.ts to avoid circular imports
