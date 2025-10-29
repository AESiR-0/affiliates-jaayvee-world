import { pgTable, uuid, varchar, text, integer, numeric, timestamp, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../shared'
import { ventures } from './venture'

// Affiliates table - main affiliate profiles
export const affiliates = pgTable('affiliates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).default('10.00'), // Default 10%
  totalEarnings: numeric('total_earnings', { precision: 12, scale: 2 }).default('0.00'),
  totalReferrals: integer('total_referrals').default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Affiliate Links table - tracks individual referral links
export const affiliateLinks = pgTable('affiliate_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  ventureId: uuid('venture_id').notNull().references(() => ventures.id, { onDelete: 'cascade' }),
  eventId: uuid('event_id'), // Optional - for event-specific links
  linkCode: varchar('link_code', { length: 100 }).unique().notNull(),
  originalUrl: text('original_url'), // The original URL being promoted
  affiliateId: uuid('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  qrCodeUrl: text('qr_code_url'), // URL to QR code image
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Affiliate Commissions table - tracks commission payments
export const affiliateCommissions = pgTable('affiliate_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  affiliateId: uuid('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  linkId: uuid('link_id').references(() => affiliateLinks.id, { onDelete: 'set null' }),
  ventureId: uuid('venture_id').notNull().references(() => ventures.id, { onDelete: 'cascade' }),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  commissionRate: numeric('commission_rate', { precision: 5, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending'), // pending, paid, cancelled
  referenceId: varchar('reference_id', { length: 100 }), // Reference to the sale/transaction
  notes: text('notes'),
  paidAt: timestamp('paid_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const affiliatesRelations = relations(affiliates, ({ one, many }) => ({
  user: one(users, {
    fields: [affiliates.userId],
    references: [users.id],
  }),
  links: many(affiliateLinks),
  commissions: many(affiliateCommissions),
}))

export const affiliateLinksRelations = relations(affiliateLinks, ({ one, many }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateLinks.affiliateId],
    references: [affiliates.id],
  }),
  venture: one(ventures, {
    fields: [affiliateLinks.ventureId],
    references: [ventures.id],
  }),
  commissions: many(affiliateCommissions),
}))

export const affiliateCommissionsRelations = relations(affiliateCommissions, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateCommissions.affiliateId],
    references: [affiliates.id],
  }),
  link: one(affiliateLinks, {
    fields: [affiliateCommissions.linkId],
    references: [affiliateLinks.id],
  }),
  venture: one(ventures, {
    fields: [affiliateCommissions.ventureId],
    references: [ventures.id],
  }),
}))
