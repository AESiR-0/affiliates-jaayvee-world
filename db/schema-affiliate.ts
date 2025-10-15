import { pgTable, uuid, varchar, text, timestamp, boolean, integer, decimal } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './models/user'

// Affiliate-specific tables
export const affiliates = pgTable('affiliates', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  code: varchar('code', { length: 50 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  isActive: boolean('is_active').default(true).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).default('0.00'),
  totalEarnings: decimal('total_earnings', { precision: 10, scale: 2 }).default('0.00'),
  totalReferrals: integer('total_referrals').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const affiliateLinks = pgTable('affiliate_links', {
    id: uuid('id').primaryKey().defaultRandom(),
    affiliateId: uuid('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
    ventureId: uuid('venture_id').notNull(),
    eventId: uuid('event_id'),
    linkCode: varchar('link_code', { length: 100 }).notNull().unique(),
    originalUrl: text('original_url').notNull(),
    shortUrl: varchar('short_url', { length: 255 }),
    qrCodeUrl: varchar('qr_code_url', { length: 500 }),
    clicks: integer('clicks').default(0),
    conversions: integer('conversions').default(0),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const affiliateCommissions = pgTable('affiliate_commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  affiliateId: uuid('affiliate_id').notNull().references(() => affiliates.id, { onDelete: 'cascade' }),
  linkId: uuid('link_id').references(() => affiliateLinks.id, { onDelete: 'set null' }),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  commissionRate: decimal('commission_rate', { precision: 5, scale: 2 }).notNull(),
  status: varchar('status', { length: 20 }).default('pending').notNull(), // pending, approved, paid
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Relations - simplified to avoid circular dependencies
export const affiliatesRelations = relations(affiliates, ({ one }) => ({
  user: one(users, {
    fields: [affiliates.userId],
    references: [users.id],
  }),
}))

export const affiliateLinksRelations = relations(affiliateLinks, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateLinks.affiliateId],
    references: [affiliates.id],
  }),
}))

export const affiliateCommissionsRelations = relations(affiliateCommissions, ({ one }) => ({
  affiliate: one(affiliates, {
    fields: [affiliateCommissions.affiliateId],
    references: [affiliates.id],
  }),
}))
