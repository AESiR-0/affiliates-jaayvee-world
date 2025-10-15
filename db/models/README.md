# Database Models Organization

This directory contains the organized database models for the Jaayvee World application. The models are split into logical files for better maintainability and organization.

## File Structure

```
lib/db/models/
├── index.ts          # Main export file - exports all models
├── enums.ts          # Database enums (user roles, status types, etc.)
├── user.ts           # User, roles, permissions, and RBAC models
├── venture.ts        # Venture and business models
├── event.ts          # Event, ticket, and ticket type models
├── payment.ts        # Payment, invoice, wallet, and transaction models
├── subscription.ts   # Subscription plans and user subscriptions
├── audit.ts          # Audit logs and system tracking
├── relations.ts      # All model relations (avoids circular dependencies)
└── README.md         # This documentation file
```

## Model Categories

### 1. **Enums** (`enums.ts`)
- `userRoleEnum` - User role types (admin, organizer, user, affiliates, customers, staff, influencers)
- `ticketStatusEnum` - Ticket status (available, sold, used, cancelled)
- `paymentStatusEnum` - Payment status (pending, completed, failed, refunded)
- `invoiceStatusEnum` - Invoice status (pending, paid, cancelled)

### 2. **User & RBAC** (`user.ts`)
- `users` - User accounts
- `roles` - User roles with hierarchy levels
- `permissions` - System permissions
- `rolePermissions` - Role-permission mappings

### 3. **Ventures** (`venture.ts`)
- `ventures` - Business ventures and organizations

### 4. **Events & Tickets** (`event.ts`)
- `events` - Event listings
- `ticketTypes` - Different types of tickets for events
- `tickets` - Individual ticket instances

### 5. **Payments & Wallets** (`payment.ts`)
- `wallets` - User wallet accounts
- `transactions` - Wallet transactions
- `invoices` - Payment invoices
- `payments` - Payment records

### 6. **Subscriptions** (`subscription.ts`)
- `subscriptionPlans` - Available subscription plans
- `subscriptions` - User subscription records

### 7. **Audit & System** (`audit.ts`)
- `auditLogs` - System audit trail

### 8. **Relations** (`relations.ts`)
- All model relationships are defined here to avoid circular dependencies
- Contains complete relation definitions for all models

## Usage

### Import from main schema (recommended)
```typescript
import { users, events, tickets } from '@/lib/db/schema'
```

### Import from specific model files
```typescript
import { users, roles } from '@/lib/db/models/user'
import { events, tickets } from '@/lib/db/models/event'
```

### Import all models
```typescript
import * as models from '@/lib/db/models'
```

## Benefits of This Organization

1. **Maintainability** - Each file focuses on a specific domain
2. **Scalability** - Easy to add new models to appropriate files
3. **Team Collaboration** - Multiple developers can work on different model files
4. **Code Navigation** - Easier to find specific models
5. **Reduced Conflicts** - Less chance of merge conflicts in large files
6. **Clear Dependencies** - Relations are centralized and well-defined

## Migration Notes

- All existing imports from `@/lib/db/schema` will continue to work
- The main schema file re-exports everything for backward compatibility
- Relations are now centralized in `relations.ts` to avoid circular dependencies
- Each model file is self-contained with only the necessary imports
