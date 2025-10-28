import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from '../user'

// Staff Profiles table - optional staff metadata for name/face auth scaffolding
export const staffProfiles = pgTable('staff_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }).unique(),
  displayName: text('display_name'),
  faceTemplateUrl: text('face_template_url'),    // optional; store in Supabase storage
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const staffProfilesRelations = relations(staffProfiles, ({ one }) => ({
  user: one(users, {
    fields: [staffProfiles.userId],
    references: [users.id],
  }),
}))
