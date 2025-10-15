// Main schema file - imports and exports all models from organized files
export * from './models/user'
export * from './models/venture'
export * from './models/relations'

// Re-export everything for backward compatibility
export {
  // User & RBAC
  users,
  roles,
  permissions,
  rolePermissions,
} from './models/user'

export {
  // Ventures
  ventures,
} from './models/venture'