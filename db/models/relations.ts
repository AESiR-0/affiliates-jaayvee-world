import { relations } from 'drizzle-orm'
import { users, roles } from './user'
import { ventures } from './venture'

// Basic user relations
export const usersRelations = relations(users, ({ one }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
}))

// Basic venture relations
export const venturesRelations = relations(ventures, ({ one }) => ({
    owner: one(users, {
        fields: [ventures.ownerId],
        references: [users.id],
    }),
}))