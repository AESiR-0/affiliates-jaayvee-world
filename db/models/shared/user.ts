import { pgTable, uuid, varchar, boolean, timestamp, integer, unique, text } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// Core User & RBAC Tables
export const roles = pgTable('roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull().unique(),
    symbol: varchar('symbol', { length: 10 }), // 🧍‍♂️, 🏪, 💼, etc.
    level: integer('level').notNull(),
    description: text('description'),
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
    // Note: firebase_uid column doesn't exist in actual database
    // firebaseUid: varchar('firebase_uid', { length: 255 }).unique(),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'restrict' }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// User-Roles Junction Table for Multiple Roles
export const userRoles = pgTable('user_roles', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    roleId: uuid('role_id').notNull().references(() => roles.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(), // for role approval status
    createdAt: timestamp('created_at').defaultNow().notNull(),
    approvedAt: timestamp('approved_at'),
    approvedBy: uuid('approved_by').references(() => users.id),
}, (table) => ({
    uniqueUserRole: unique('unique_user_role').on(table.userId, table.roleId),
}))

