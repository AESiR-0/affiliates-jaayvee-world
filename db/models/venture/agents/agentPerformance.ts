import { pgTable, uuid, integer, numeric, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { agents } from './agents'

// Agent performance tracking table
export const agentPerformance = pgTable('agent_performance', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  month: text('month').notNull(), // Format: 'YYYY-MM'
  totalMerchants: integer('total_merchants').default(0).notNull(),
  verifiedMerchants: integer('verified_merchants').default(0).notNull(),
  totalTxns: integer('total_txns').default(0).notNull(),
  commissionEarned: numeric('commission_earned', { precision: 12, scale: 2 }).default('0').notNull(),
  qrScans: integer('qr_scans').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const agentPerformanceRelations = relations(agentPerformance, ({ one }) => ({
  agent: one(agents, {
    fields: [agentPerformance.agentId],
    references: [agents.id],
  }),
}))
