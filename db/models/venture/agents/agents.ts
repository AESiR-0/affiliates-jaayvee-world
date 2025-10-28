import { pgTable, uuid, integer, numeric, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../../shared/user'
import { ventures } from '../venture'
import { agentMerchantAssignments } from './agentMerchantAssignments'
import { agentPerformance } from './agentPerformance'

// Agents table - represents agents in the system
export const agents = pgTable('agents', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ventureId: uuid('venture_id').notNull().references(() => ventures.id, { onDelete: 'cascade' }),
  referralCode: text('referral_code').unique(), // nullable in actual database
  totalMerchants: integer('total_merchants').default(0).notNull(),
  verifiedMerchants: integer('verified_merchants').default(0).notNull(),
  totalTxns: integer('total_txns').default(0).notNull(),
  commissionEarned: numeric('commission_earned', { precision: 12, scale: 2 }).default('0').notNull(),
  level: text('level').default('bronze').notNull(), // 'bronze', 'silver', 'gold', 'platinum'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const agentsRelations = relations(agents, ({ one, many }) => ({
  user: one(users, {
    fields: [agents.userId],
    references: [users.id],
  }),
  venture: one(ventures, {
    fields: [agents.ventureId],
    references: [ventures.id],
  }),
  merchantAssignments: many(agentMerchantAssignments),
  performance: many(agentPerformance),
}))
