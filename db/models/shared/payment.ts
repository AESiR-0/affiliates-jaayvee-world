import { pgTable, uuid, varchar, real, integer, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'
import { ventures } from '../venture/venture'
import { events } from '../venture/event'
import { invoiceStatusEnum, paymentStatusEnum } from './enums'

// Wallets & Transactions
export const wallets = pgTable('wallets', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
    balance: real('balance').default(0.0).notNull(),
    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const transactions = pgTable('transactions', {
    id: uuid('id').primaryKey().defaultRandom(),
    // Note: user_id, agent_id, status, description columns don't exist in actual database
    // userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    // agentId: uuid('agent_id').references(() => users.id, { onDelete: 'set null' }),
    walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    amount: real('amount').notNull(),
    // status: varchar('status', { length: 50 }).default('pending').notNull(),
    // description: varchar('description', { length: 500 }),
    reference: varchar('reference', { length: 255 }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Invoices & Payments
export const invoices = pgTable('invoices', {
    id: uuid('id').primaryKey().defaultRandom(),
    ventureId: uuid('venture_id').references(() => ventures.id, { onDelete: 'set null' }),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    amount: real('amount').notNull(),
    currency: varchar('currency', { length: 3 }).default('INR').notNull(),
    status: invoiceStatusEnum('status').default('pending').notNull(),
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const payments = pgTable('payments', {
    id: uuid('id').primaryKey().defaultRandom(),
    invoiceId: uuid('invoice_id').notNull().references(() => invoices.id, { onDelete: 'cascade' }),
    provider: varchar('provider', { length: 50 }).notNull(),
    reference: varchar('reference', { length: 255 }).notNull(),
    amount: real('amount').notNull(),
    status: paymentStatusEnum('status').default("pending").notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Coupons
export const coupons = pgTable('coupons', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 50 }).notNull().unique(),
    name: varchar('name', { length: 255 }).notNull(),
    discount: real('discount').notNull(),
    discountType: varchar('discount_type', { length: 20 }).notNull(), // 'percentage' or 'fixed'
    usageLimit: integer('usage_limit').notNull(),
    usedCount: integer('used_count').default(0).notNull(),
    validFrom: timestamp('valid_from').notNull(),
    validUntil: timestamp('valid_until').notNull(),
    applicableTo: varchar('applicable_to', { length: 20 }).notNull(), // 'all', 'event', 'category'
    eventId: uuid('event_id').references(() => events.id, { onDelete: 'set null' }),
    category: varchar('category', { length: 100 }),
    status: varchar('status', { length: 20 }).default('active').notNull(), // 'active', 'expired', 'used_up'
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

