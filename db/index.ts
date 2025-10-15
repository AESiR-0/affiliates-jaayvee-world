import { drizzle } from 'drizzle-orm/postgres-js'
const postgres = require('postgres')

// Create the connection
const connectionString = process.env.DATABASE_URL!

// Disable prefetch as it is not supported for "Transaction" pool mode
const client = postgres(connectionString, { prepare: false })

// Create database client without schema to avoid circular dependencies
export const db = drizzle(client)

// Export schema for use in other files
export * from './schema'
export * from './schema-affiliate'
