import { pgTable, uuid, text, integer, numeric, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../user'

// Staff Affiliates table - tracks staff referral codes and performance
export const staffAffiliates = pgTable('staff_affiliates', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffUserId: uuid('staff_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  referralCode: text('referral_code').unique().notNull(),
  totalClicks: integer('total_clicks').default(0).notNull(),
  totalSignups: integer('total_signups').default(0).notNull(),
  commissionEarned: numeric('commission_earned', { precision: 12, scale: 2 }).default('0').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const staffAffiliatesRelations = relations(staffAffiliates, ({ one }) => ({
  staffUser: one(users, {
    fields: [staffAffiliates.staffUserId],
    references: [users.id],
  }),
}))
