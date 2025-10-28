import { pgTable, uuid, varchar, real, timestamp, integer, jsonb, boolean } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'

// Subscription Plans
export const subscriptionPlans = pgTable('subscription_plans', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    price: real('price').notNull(),
    duration: integer('duration').notNull(), // in days
    features: jsonb('features'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const subscriptions = pgTable('subscriptions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    planId: uuid('plan_id').notNull().references(() => subscriptionPlans.id, { onDelete: 'cascade' }),
    startAt: timestamp('start_at').defaultNow().notNull(),
    endAt: timestamp('end_at').notNull(),
    active: boolean('active').default(true).notNull(),
})

// Relations are defined in relations.ts to avoid circular dependencies
