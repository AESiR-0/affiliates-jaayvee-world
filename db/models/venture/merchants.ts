import { pgTable, uuid, text, varchar, boolean, timestamp } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import { agents } from './agents/agents'; // Assuming agents model exists

export const merchants = pgTable("merchants", {
  id: uuid("id").primaryKey().defaultRandom(),
  businessName: text("business_name").notNull(),
  contactName: text("contact_name"),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  pincode: varchar("pincode", { length: 10 }),
  status: varchar("status", { length: 50 }).default('pending').notNull(), // e.g., 'pending', 'active', 'inactive'
  isActive: boolean("is_active").default(false).notNull(),
  createdByAgent: uuid("created_by_agent").references(() => agents.id, { onDelete: 'set null' }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
});

export const merchantsRelations = relations(merchants, ({ one }) => ({
  agent: one(agents, {
    fields: [merchants.createdByAgent],
    references: [agents.id],
  }),
}));