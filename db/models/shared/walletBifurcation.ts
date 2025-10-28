import { pgTable, uuid, real, timestamp, text, boolean, integer } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'

// Wallet Bifurcation System - 4 wallet types per user
export const walletBifurcation = pgTable('wallet_bifurcation', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  // 1. Voucher Balance - For vouchers/gift cards
  voucherBalance: real('voucher_balance').default(0.0).notNull(),
  
  // 2. Points - Loyalty points (5 points = 1 rupee)
  points: integer('points').default(0).notNull(),
  
  // 3. Wallet Actual Balance - Main cash balance
  actualBalance: real('actual_balance').default(0.0).notNull(),
  
  // 4. FD (Fixed Deposit) - Minimum balance requirement
  fdBalance: real('fd_balance').default(0.0).notNull(),
  
  // Wallet metadata
  currency: text('currency').default('INR').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Wallet Transactions - Track all wallet activities
export const walletTransactions = pgTable('wallet_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  walletId: uuid('wallet_id').notNull().references(() => walletBifurcation.id, { onDelete: 'cascade' }),
  
  // Transaction details
  type: text('type').notNull(), // 'credit', 'debit', 'transfer', 'conversion'
  category: text('category').notNull(), // 'voucher', 'points', 'actual', 'fd'
  amount: real('amount').notNull(),
  points: integer('points').default(0), // For point transactions
  
  // Transaction metadata
  description: text('description'),
  reference: text('reference'), // External reference ID
  status: text('status').default('completed').notNull(), // 'pending', 'completed', 'failed'
  
  // Conversion rates and calculations
  conversionRate: real('conversion_rate').default(5.0), // 5 points = 1 rupee
  originalAmount: real('original_amount'), // Original amount before conversion
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Wallet Conversion Rules - Define conversion rates and rules
export const walletConversionRules = pgTable('wallet_conversion_rules', {
  id: uuid('id').primaryKey().defaultRandom(),
  
  // Conversion rules
  fromCategory: text('from_category').notNull(), // 'points', 'voucher', 'actual'
  toCategory: text('to_category').notNull(), // 'points', 'voucher', 'actual', 'fd'
  
  // Conversion rates
  conversionRate: real('conversion_rate').notNull(), // e.g., 5.0 for points to actual
  minAmount: real('min_amount').default(0.0), // Minimum amount for conversion
  maxAmount: real('max_amount'), // Maximum amount for conversion
  
  // Rules and restrictions
  isActive: boolean('is_active').default(true).notNull(),
  requiresApproval: boolean('requires_approval').default(false).notNull(),
  dailyLimit: real('daily_limit'), // Daily conversion limit
  
  // Timestamps
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const walletBifurcationRelations = relations(walletBifurcation, ({ one, many }) => ({
  user: one(users, {
    fields: [walletBifurcation.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}))

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  user: one(users, {
    fields: [walletTransactions.userId],
    references: [users.id],
  }),
  wallet: one(walletBifurcation, {
    fields: [walletTransactions.walletId],
    references: [walletBifurcation.id],
  }),
}))