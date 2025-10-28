import { pgTable, uuid, text, timestamp, jsonb } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../user'

// Staff Audit Logs table - immutable action log for staff activities
export const staffAuditLogs = pgTable('staff_audit_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  staffUserId: uuid('staff_user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text('action').notNull(),              // 'QR_GENERATE' | 'QR_ASSIGN' | 'MERCHANT_VERIFY'...
  entity: text('entity').notNull(),              // 'qr_batch' | 'qr_codes' | 'agent' | 'merchant'
  entityId: text('entity_id'),
  meta: jsonb('meta'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const staffAuditLogsRelations = relations(staffAuditLogs, ({ one }) => ({
  staffUser: one(users, {
    fields: [staffAuditLogs.staffUserId],
    references: [users.id],
  }),
}))
