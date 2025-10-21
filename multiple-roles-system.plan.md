# Multiple Roles and Role Switching Implementation Plan

## Role Definitions

| Role            | Symbol | Short Description                                                                            | Example Username     |
| --------------- | ------ | -------------------------------------------------------------------------------------------- | -------------------- |
| **User**        | 🧍‍♂️  | Regular customer who shops, books, or attends events using Ease wallet.                      | `jay_user`           |
| **Merchant**    | 🏪     | Business owner offering products or services; their QR links to Ease for tracked referrals.  | `cafe_blend`         |
| **Agent**       | 💼     | Onboards and manages merchants; earns commission from their activity.                        | `raj_agent`          |
| **Affiliate**   | 🌐     | Promoter sharing general Jaayvee referral links across platforms; earns passive commissions. | `sam_affiliate`      |
| **Influencer**  | 📣     | Social creator promoting merchants/events with proof uploads for cashback.                   | `tina_influencer`    |
| **Staff**       | 🧾     | Internal validator or finance operator handling KYC, payouts, or campaign checks.            | `neha_staff`         |
| **Admin**       | 🛠️    | Manages users, permissions, and payouts across all Jaayvee platforms.                        | `admin_jvw`          |
| **Super Admin** | 👑     | System-level controller with full access to configuration and logs.                          | `jayneel_superadmin` |

## Browser Storage Schema

| Key                    | Type         | Example Value                                                                    | Purpose                               |
| ---------------------- | ------------ | -------------------------------------------------------------------------------- | ------------------------------------- |
| `tjw_role`             | String       | `"merchant"` / `"agent"` / `"influencer"` / `"user"` / `"affiliate"` / `"staff"` | Current active role                   |
| `tjw_referrer`         | String       | `"JVW12345"` (referral code)                                                     | Oldest referral source                |
| `tjw_roles_available`  | Array        | `["user", "influencer"]`                                                         | List of roles user can switch between |
| `tjw_wallet_balance`   | Number       | `240.50`                                                                         | Optional quick-access display         |
| `tjw_auth_token`       | JWT / String | `"eyJhbGc..."`                                                                   | (Optional) cached session             |
| `tjw_subdomain_origin` | String       | `"ease"` / `"talaash"` / `"clothing"`                                            | Analytics context                     |

## Current State Analysis

Your system currently uses a **one-to-many** relationship:

- `users.roleId` → foreign key to `roles.id`
- Each user has exactly ONE role
- Session/JWT stores: `role` (string), `roleLevel` (number)

## Backend Changes

### 1. Database Schema Migration

**Create `user_roles` junction table** in `lib/db/models/shared/user.ts`:

```typescript
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
```

**Update roles table with symbols and descriptions**:

```typescript
export const roles = pgTable('roles', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 255 }).notNull().unique(),
  symbol: varchar('symbol', { length: 10 }), // 🧍‍♂️, 🏪, 💼, etc.
  level: integer('level').notNull(),
  description: text('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})
```

**Keep `roleId` for backward compatibility** (will point to primary/first role).

**NO `activeRoleId` in database** - active role stored only in browser storage/cookies.

### 2. Update Relations

**In `lib/db/models/venture/relations.ts`**, update `usersRelations`:

```typescript
export const usersRelations = relations(users, ({ one, many }) => ({
    role: one(roles, { // primary role
        fields: [users.roleId],
        references: [roles.id],
    }),
    userRoles: many(userRoles), // all assigned roles
    // ... existing relations
}))

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
```

### 3. Update Authentication

**In `lib/auth.ts`** (NextAuth callbacks):

- JWT callback: Add `roles: string[]` (no activeRoleId)
- Session callback: Include all roles, get active role from browser storage

**In `app/api/auth/login/route.ts`**:

- Fetch all user roles from `user_roles` table
- Return `roles: []` array with all role names
- Generate JWT with all roles (no active role in JWT)
- Set browser storage with `tjw_*` keys

**In `types/next-auth.d.ts`**:

```typescript
interface Session {
  user: {
    id: string
    // ... existing
    roles?: string[] // all assigned roles
    // NO activeRoleId - stored in browser storage only
  }
}
```

### 4. Create API Endpoints

**`/api/user/roles/route.ts`** (GET):

- Fetch all roles assigned to current user
- Return with `isPrimary`, role details, symbols
- Include approval status for pending roles
- NO active role - that's in browser storage

**`/api/user/switch-role/route.ts`** (POST):

```typescript
// Request: { roleName: "merchant" }
// Response: { success: true, message: "Role switched" }
```

**What happens**:
1. Validate user has access to requested role (check `user_roles` table)
2. Update browser storage: `tjw_role = "merchant"`
3. Return success (no database update needed)
4. Frontend updates UI to reflect new role

**`/api/user/register-role/route.ts`** (POST):

- Allow users to self-register for certain roles (influencer, affiliate, merchant)
- Insert into `user_roles` table with `isActive = false` for approval
- Auto-approve for basic roles (user, affiliate)
- Require admin approval for staff/admin roles
- Return registration status

### 5. Update Middleware

**In `middleware.ts`**:

- Read `tjw_role` from browser storage/cookies
- Validate active role against user's available roles from `user_roles` table
- Pass active role in headers for API authorization
- Remove hardcoded user ID

## Frontend Changes

### 6. Auth Context Updates

**In `lib/auth-context.tsx`**:

- Add `roles: string[]`, `activeRole: string` (from browser storage)
- Add `switchRole(roleName: string)` function
- Add browser storage management functions:

```typescript
const setBrowserStorage = (user: User, roles: Role[]) => {
  localStorage.setItem('tjw_role', user.activeRole);
  localStorage.setItem('tjw_roles_available', JSON.stringify(roles.map(r => r.name)));
  localStorage.setItem('tjw_wallet_balance', user.walletBalance?.toString() || '0');
  localStorage.setItem('tjw_auth_token', token);
  localStorage.setItem('tjw_subdomain_origin', 'jaayvee');
}

const loadFromBrowserStorage = () => {
  const activeRole = localStorage.getItem('tjw_role');
  const availableRoles = JSON.parse(localStorage.getItem('tjw_roles_available') || '[]');
  const walletBalance = parseFloat(localStorage.getItem('tjw_wallet_balance') || '0');
  const authToken = localStorage.getItem('tjw_auth_token');
  const subdomainOrigin = localStorage.getItem('tjw_subdomain_origin');
}
```

- Update login to fetch all roles and set browser storage

### 7. Role Switcher Component

**Create `components/ui/role-switcher.tsx`**:

- Dropdown showing current active role with symbol (🏪 Merchant)
- List all available roles for user with symbols
- Show role status indicators (pending/approved)
- "Register for New Role" button → opens modal
- Call `/api/user/switch-role` on selection
- Update browser storage and local auth state

### 8. Role Registration Modal

**Create `components/ui/role-registration-modal.tsx`**:

- Form fields based on role type:
  - **Influencer**: Social media handles, follower count, content examples
  - **Affiliate**: Website/social presence, marketing experience  
  - **Merchant**: Business details, GST, bank details
  - **Agent**: Previous experience, references
  - **Staff**: Internal application (admin approval required)
- Submit to `/api/user/register-role`
- Show pending/approved status
- Conditional fields based on role selection

### 9. TopNav Integration

**In `components/nav/TopNav.tsx`**:

- Add `<RoleSwitcher />` next to user menu
- Display current active role badge with symbol
- Show role indicator icon
- Display wallet balance from `tjw_wallet_balance`

### 10. Update Protected Routes

**In `components/auth/AdminRoute.tsx`** and similar guards:

- Check `user.activeRole` (from browser storage) instead of `user.role`
- Validate active role matches required permission
- Support role-based access control with symbols

## Migration Strategy

**Create migration file `drizzle/0008_*.sql`**:

```sql
-- 1. Add symbols and descriptions to roles
ALTER TABLE roles ADD COLUMN symbol varchar(10);
ALTER TABLE roles ADD COLUMN description text;

-- 2. Create user_roles junction table
CREATE TABLE user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  is_primary boolean DEFAULT false NOT NULL,
  is_active boolean DEFAULT true NOT NULL,
  created_at timestamp DEFAULT now() NOT NULL,
  approved_at timestamp,
  approved_by uuid REFERENCES users(id),
  CONSTRAINT unique_user_role UNIQUE(user_id, role_id)
);

-- 3. Migrate existing data
INSERT INTO user_roles (user_id, role_id, is_primary, is_active)
SELECT id, role_id, true, true FROM users;

-- 4. Update roles with symbols and descriptions
UPDATE roles SET symbol = '🧍‍♂️', description = 'Regular customer who shops, books, or attends events using Ease wallet.' WHERE name = 'user';
UPDATE roles SET symbol = '🏪', description = 'Business owner offering products or services; their QR links to Ease for tracked referrals.' WHERE name = 'merchant';
UPDATE roles SET symbol = '💼', description = 'Onboards and manages merchants; earns commission from their activity.' WHERE name = 'agent';
UPDATE roles SET symbol = '🌐', description = 'Promoter sharing general Jaayvee referral links across platforms; earns passive commissions.' WHERE name = 'affiliate';
UPDATE roles SET symbol = '📣', description = 'Social creator promoting merchants/events with proof uploads for cashback.' WHERE name = 'influencer';
UPDATE roles SET symbol = '🧾', description = 'Internal validator or finance operator handling KYC, payouts, or campaign checks.' WHERE name = 'staff';
UPDATE roles SET symbol = '🛠️', description = 'Manages users, permissions, and payouts across all Jaayvee platforms.' WHERE name = 'admin';
UPDATE roles SET symbol = '👑', description = 'System-level controller with full access to configuration and logs.' WHERE name = 'super_admin';
```

## Key Implementation Details

### Browser Storage Management

```typescript
// Set browser storage on login/role switch
const setBrowserStorage = (user: User, roles: Role[]) => {
  localStorage.setItem('tjw_role', user.activeRole);
  localStorage.setItem('tjw_roles_available', JSON.stringify(roles.map(r => r.name)));
  localStorage.setItem('tjw_wallet_balance', user.walletBalance?.toString() || '0');
  localStorage.setItem('tjw_auth_token', token);
  localStorage.setItem('tjw_subdomain_origin', 'jaayvee'); // or detect from domain
}

// Read from browser storage on app load
const loadFromBrowserStorage = () => {
  const activeRole = localStorage.getItem('tjw_role');
  const availableRoles = JSON.parse(localStorage.getItem('tjw_roles_available') || '[]');
  const walletBalance = parseFloat(localStorage.getItem('tjw_wallet_balance') || '0');
  const authToken = localStorage.getItem('tjw_auth_token');
  const subdomainOrigin = localStorage.getItem('tjw_subdomain_origin');
}
```

### Role Switching API Payload

```typescript
// POST /api/user/switch-role
{
  "roleName": "merchant" // role name, not ID
}

// Response
{
  "success": true,
  "message": "Role switched to merchant",
  "data": {
    "activeRole": "merchant",
    "symbol": "🏪"
  }
}
```

### Role Registration Form Fields

**Influencer Registration:**
- Social media handles (Instagram, TikTok, YouTube)
- Follower count per platform
- Content examples/portfolio links
- Preferred content categories

**Affiliate Registration:**
- Website/social presence
- Marketing experience
- Preferred promotion methods
- Target audience description

**Merchant Registration:**
- Business name and type
- GST number
- Bank account details
- Business address and contact

**Agent Registration:**
- Previous sales experience
- References
- Target market/geography
- Commission expectations

## Files to Create/Modify

**Create:**

- `app/api/user/roles/route.ts`
- `app/api/user/switch-role/route.ts`
- `app/api/user/register-role/route.ts`
- `components/ui/role-switcher.tsx`
- `components/ui/role-registration-modal.tsx`
- Migration: `drizzle/0008_*.sql`

**Modify:**

- `lib/db/models/shared/user.ts` (add userRoles table, update roles)
- `lib/db/models/venture/relations.ts` (add userRoles relations)
- `lib/db/schema.ts` (export userRoles)
- `types/next-auth.d.ts` (add roles array, NO activeRoleId)
- `lib/auth.ts` (update callbacks for multiple roles)
- `lib/auth-context.tsx` (add browser storage, switchRole function)
- `app/api/auth/login/route.ts` (fetch all roles, set browser storage)
- `app/api/auth/me/route.ts` (return all roles)
- `middleware.ts` (use activeRole from browser storage)
- `components/nav/TopNav.tsx` (integrate role switcher)
- `components/auth/AdminRoute.tsx` (check activeRole from storage)

## To-dos

- [ ] Create user_roles junction table and add symbols to roles table in database schema
- [ ] Update Drizzle relations for users and new userRoles table
- [ ] Generate and run Drizzle migration to create user_roles table and migrate existing data
- [ ] Create GET /api/user/roles endpoint to fetch user's assigned roles with symbols
- [ ] Create POST /api/user/switch-role endpoint to change active role (browser storage only)
- [ ] Create POST /api/user/register-role endpoint for self-registration with role-specific forms
- [ ] Update TypeScript types for Session/User/JWT to include roles array (NO activeRoleId)
- [ ] Modify NextAuth callbacks in lib/auth.ts to handle multiple roles
- [ ] Update login API to fetch and return all user roles and set browser storage
- [ ] Add switchRole function and roles state to auth context with browser storage management
- [ ] Create RoleSwitcher dropdown component for TopNav with symbols and status indicators
- [ ] Create RoleRegistrationModal for registering new roles with conditional form fields
- [ ] Integrate role switcher into TopNav component with wallet balance display
- [ ] Update middleware to use activeRole from browser storage and remove hardcoded user ID
- [ ] Update AdminRoute and other guards to check activeRole from browser storage
- [ ] Add role symbols and descriptions to database
- [ ] Implement approval workflow for staff/admin role registrations
- [ ] Add analytics tracking for role switches and registrations
