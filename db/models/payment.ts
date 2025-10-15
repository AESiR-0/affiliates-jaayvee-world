import { pgTable, uuid, varchar, real, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'
import { ventures } from './venture'
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
    walletId: uuid('wallet_id').notNull().references(() => wallets.id, { onDelete: 'cascade' }),
    type: varchar('type', { length: 50 }).notNull(),
    amount: real('amount').notNull(),
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

