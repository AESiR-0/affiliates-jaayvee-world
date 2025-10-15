import { pgTable, uuid, varchar, text, boolean, timestamp, integer, real, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'
import { ventures } from './venture'
import { ticketStatusEnum } from './enums'

// Events, Tickets, Orders
export const events = pgTable('events', {
    id: uuid('id').primaryKey().defaultRandom(),
    ventureId: uuid('venture_id').notNull().references(() => ventures.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    slug: varchar('slug', { length: 255 }),
    banner: varchar('banner', { length: 500 }),
    startDate: timestamp('start_date').notNull(),
    endDate: timestamp('end_date'),
    venue: jsonb('venue'),
    published: boolean('published').default(false).notNull(),
    status: varchar('status', { length: 50 }).default('draft').notNull(),
    createdBy: uuid('created_by').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    seatingConfig: jsonb('seating_config'),
    pricingRules: jsonb('pricing_rules'),
    attributes: jsonb('attributes'),
})

export const ticketTypes = pgTable('ticket_types', {
    id: uuid('id').primaryKey().defaultRandom(),
    eventId: uuid('event_id').notNull().references(() => events.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    price: real('price').notNull(),
    capacity: integer('capacity').notNull(),
    attributes: jsonb('attributes'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const priceTiers = pgTable('price_tiers', {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketTypeId: uuid('ticket_type_id').notNull().references(() => ticketTypes.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 100 }).notNull(), // e.g., "Early Bird", "Standard", "VIP"
    price: real('price').notNull(),
    startsAt: timestamp('starts_at').notNull(),
    endsAt: timestamp('ends_at').notNull(),
    quantityCap: integer('quantity_cap').notNull(), // Max tickets for this tier
    sortOrder: integer('sort_order').default(0).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const tickets = pgTable('tickets', {
    id: uuid('id').primaryKey().defaultRandom(),
    typeId: uuid('type_id').notNull().references(() => ticketTypes.id, { onDelete: 'cascade' }),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
    status: ticketStatusEnum('status').default('available').notNull(),
    qrCode: varchar('qr_code', { length: 255 }).unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

