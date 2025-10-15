import { pgEnum } from 'drizzle-orm/pg-core'

// Database Enums
export const userRoleEnum = pgEnum('user_role', ['admin', 'organizer', 'user', 'affiliates', 'customers', 'staff', 'influencers'])
export const ticketStatusEnum = pgEnum('ticket_status', ['available', 'sold', 'used', 'cancelled'])
export const paymentStatusEnum = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded'])
export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'paid', 'cancelled'])
