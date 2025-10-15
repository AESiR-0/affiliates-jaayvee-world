import { pgTable, uuid, varchar, boolean, timestamp, integer, unique } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Core User & RBAC Tables
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    level: integer('level').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const permissions = pgTable('permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    action: varchar('action', { length: 255 }).notNull(),
    resource: varchar('resource', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const rolePermissions = pgTable('role_permissions', {
    id: uuid('id').primaryKey().defaultRandom(),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    permissionId: uuid('permission_id').notNull().references(() => permissions.id, { onDelete: 'cascade' }),
}, (table) => ({
    uniqueRolePermission: unique('unique_role_permission').on(table.roleId, table.permissionId),
}))

export const users = pgTable('users', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    phone: varchar('phone', { length: 20 }),
    password: varchar('password', { length: 255 }).notNull(),
    fullName: varchar('full_name', { length: 255 }).notNull(),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'restrict' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

