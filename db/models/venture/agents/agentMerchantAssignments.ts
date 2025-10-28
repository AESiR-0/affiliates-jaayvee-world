import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { agents } from './agents'

// Agent-Merchant assignments table
export const agentMerchantAssignments = pgTable('agent_merchant_assignments', {
  id: uuid('id').primaryKey().defaultRandom(),
  agentId: uuid('agent_id').notNull().references(() => agents.id, { onDelete: 'cascade' }),
  merchantId: uuid('merchant_id').notNull(), // References merchants table (to be created)
  status: text('status').default('pending').notNull(), // 'pending', 'verified', 'rejected'
  assignedAt: timestamp('assigned_at', { withTimezone: true }).defaultNow().notNull(),
  verifiedAt: timestamp('verified_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const agentMerchantAssignmentsRelations = relations(agentMerchantAssignments, ({ one }) => ({
  agent: one(agents, {
    fields: [agentMerchantAssignments.agentId],
    references: [agents.id],
  }),
}))
