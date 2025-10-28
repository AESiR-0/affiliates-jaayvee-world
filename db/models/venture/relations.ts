import { relations } from 'drizzle-orm'
import { users, roles, rolePermissions, permissions, userRoles } from '../shared/user'
import { ventures } from './venture'
import { events, ticketTypes, tickets, priceTiers } from './event'
import { wallets, transactions, invoices, payments } from '../shared/payment'
import { subscriptionPlans, subscriptions } from '../shared/subscription'
import { auditLogs } from '../shared/audit'
import { agents } from './agents'
import { qrBatches, qrCodes, qrAssignments } from './agents'

// Complete user relations with all cross-model references
export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, {
        fields: [users.roleId],
        references: [roles.id],
    }),
    userRoles: many(userRoles), // all assigned roles
    wallet: one(wallets, {
        fields: [users.id],
        references: [wallets.userId],
    }),
    subscriptions: many(subscriptions),
    ventures: many(ventures),
    auditLogs: many(auditLogs),
    tickets: many(tickets),
    invoices: many(invoices),
}))

// Complete venture relations
export const venturesRelations = relations(ventures, ({ one, many }) => ({
    owner: one(users, {
        fields: [ventures.ownerId],
        references: [users.id],
    }),
    events: many(events),
    invoices: many(invoices),
    members: many(users),
}))

// Complete event relations
export const eventsRelations = relations(events, ({ one, many }) => ({
    venture: one(ventures, {
        fields: [events.ventureId],
        references: [ventures.id],
    }),
    ticketTypes: many(ticketTypes),
    tickets: many(tickets),
}))

// Complete ticket type relations
export const ticketTypesRelations = relations(ticketTypes, ({ one, many }) => ({
    event: one(events, {
        fields: [ticketTypes.eventId],
        references: [events.id],
    }),
    tickets: many(tickets),
    priceTiers: many(priceTiers),
}))

// Complete ticket relations
export const ticketsRelations = relations(tickets, ({ one }) => ({
    type: one(ticketTypes, {
        fields: [tickets.typeId],
        references: [ticketTypes.id],
    }),
    user: one(users, {
        fields: [tickets.userId],
        references: [users.id],
    }),
}))

// Complete price tier relations
export const priceTiersRelations = relations(priceTiers, ({ one, many }) => ({
    ticketType: one(ticketTypes, {
        fields: [priceTiers.ticketTypeId],
        references: [ticketTypes.id],
    }),
    tickets: many(tickets),
}))

// Complete wallet relations
export const walletsRelations = relations(wallets, ({ one, many }) => ({
    user: one(users, {
        fields: [wallets.userId],
        references: [users.id],
    }),
    transactions: many(transactions),
}))

// Complete transaction relations
export const transactionsRelations = relations(transactions, ({ one }) => ({
    wallet: one(wallets, {
        fields: [transactions.walletId],
        references: [wallets.id],
    }),
}))

// Complete subscription plan relations
export const subscriptionPlansRelations = relations(subscriptionPlans, ({ many }) => ({
    subscriptions: many(subscriptions),
}))

// Complete subscription relations
export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    user: one(users, {
        fields: [subscriptions.userId],
        references: [users.id],
    }),
    plan: one(subscriptionPlans, {
        fields: [subscriptions.planId],
        references: [subscriptionPlans.id],
    }),
}))

// Complete invoice relations
export const invoicesRelations = relations(invoices, ({ one, many }) => ({
    user: one(users, {
        fields: [invoices.userId],
        references: [users.id],
    }),
    venture: one(ventures, {
        fields: [invoices.ventureId],
        references: [ventures.id],
    }),
    payments: many(payments),
}))

// Complete payment relations
export const paymentsRelations = relations(payments, ({ one }) => ({
    invoice: one(invoices, {
        fields: [payments.invoiceId],
        references: [invoices.id],
    }),
}))

// Complete audit log relations
export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
    user: one(users, {
        fields: [auditLogs.userId],
        references: [users.id],
    }),
}))

// QR Batch relations
export const qrBatchesRelations = relations(qrBatches, ({ one, many }) => ({
    creator: one(users, {
        fields: [qrBatches.createdBy],
        references: [users.id],
    }),
    qrCodes: many(qrCodes),
}))

// QR Code relations
export const qrCodesRelations = relations(qrCodes, ({ one }) => ({
    batch: one(qrBatches, {
        fields: [qrCodes.batchId],
        references: [qrBatches.id],
    }),
    assignedAgent: one(agents, {
        fields: [qrCodes.assignedAgentId],
        references: [agents.id],
    }),
}))

// QR Assignment relations
export const qrAssignmentsRelations = relations(qrAssignments, ({ one }) => ({
    assignedByUser: one(users, {
        fields: [qrAssignments.assignedBy],
        references: [users.id],
    }),
    agent: one(agents, {
        fields: [qrAssignments.agentId],
        references: [agents.id],
    }),
}))

// User-Roles Junction Table Relations
export const userRolesRelations = relations(userRoles, ({ one }) => ({
    user: one(users, {
        fields: [userRoles.userId],
        references: [users.id],
    }),
    role: one(roles, {
        fields: [userRoles.roleId],
        references: [roles.id],
    }),
}))
