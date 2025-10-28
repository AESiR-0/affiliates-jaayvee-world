// Main schema file - imports and exports all models from organized files
export * from './models'

// Import complete relations
export * from './models/venture/relations'

// Re-export everything for backward compatibility
export {
// Enums
  userRoleEnum,
  ticketStatusEnum,
  paymentStatusEnum,
  invoiceStatusEnum,
  
  // User & RBAC
  users,
  roles,
  permissions,
  rolePermissions,
  userRoles,
  
  // Ventures
  ventures,
  
  // Influencers
  influencers,
  influencerReferrals,
  influencerSubmissions,
  
  // Affiliates
  affiliates,
  affiliateLinks,
  affiliateCommissions,
  
  // Events & Tickets
  events,
  ticketTypes,
  priceTiers,
  tickets,
  
  // Payments & Wallets
  wallets,
  transactions,
  invoices,
  payments,
  coupons,
  
  // Subscriptions
  subscriptionPlans,
  subscriptions,
  
  // Audit
  auditLogs,
  
  // Timer
  timerOffers,
  timerSessions,
  
  // Gallery
  galleryImages,
  galleryDownloads,
  galleryCategories,
  
  // NextAuth
  accounts,
  sessions,
  verificationTokens,
} from './models'