import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { agents } from './agents'
import { qrBatches } from './qrBatches'

// QR Codes table - individual QR codes with status tracking
export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').primaryKey().defaultRandom(),
  code: text('code').unique().notNull(),         // e.g., TJW0001
  batchId: uuid('batch_id').notNull().references(() => qrBatches.id, { onDelete: 'cascade' }),
  status: text('status').notNull().default('unassigned'), // 'unassigned' | 'assigned' | 'activated' | 'inactive'
  assignedAgentId: uuid('assigned_agent_id').references(() => agents.id, { onDelete: 'set null' }),
  merchantId: uuid('merchant_id'), // References merchants table (to be created)
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations are defined in relations.ts to avoid circular imports
