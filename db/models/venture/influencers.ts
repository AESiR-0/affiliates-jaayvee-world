import { pgTable, uuid, text, integer, decimal, boolean, timestamp, json } from 'drizzle-orm/pg-core'
import { users } from '../shared/user'
import { ventures } from './venture'

// Influencers table
export const influencers = pgTable('influencers', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  ventureId: uuid('venture_id').references(() => ventures.id, { onDelete: 'set null' }),
  
  // Social media handles
  instagramHandle: text('instagram_handle'),
  youtubeHandle: text('youtube_handle'),
  tiktokHandle: text('tiktok_handle'),
  twitterHandle: text('twitter_handle'),
  
  // Follower counts
  instagramFollowers: integer('instagram_followers').default(0),
  youtubeSubscribers: integer('youtube_subscribers').default(0),
  tiktokFollowers: integer('tiktok_followers').default(0),
  twitterFollowers: integer('twitter_followers').default(0),
  
  // Engagement metrics
  averageEngagementRate: decimal('average_engagement_rate', { precision: 5, scale: 2 }).default('0.00'),
  
  // Tier and status
  tier: text('tier').default('Bronze'), // Bronze, Silver, Gold, Platinum
  isActive: boolean('is_active').default(true),
  
  // Referral code
  referralCode: text('referral_code').unique(),
  
  // Commission rates
  baseCommissionRate: decimal('base_commission_rate', { precision: 5, scale: 2 }).default('5.00'),
  
  // Stats
  totalReferrals: integer('total_referrals').default(0),
  totalEarnings: decimal('total_earnings', { precision: 10, scale: 2 }).default('0.00'),
  
  // Metadata
  metadata: json('metadata'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Influencer referrals table
export const influencerReferrals = pgTable('influencer_referrals', {
  id: uuid('id').primaryKey().defaultRandom(),
  influencerId: uuid('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  ventureId: uuid('venture_id').references(() => ventures.id, { onDelete: 'set null' }),
  
  code: text('code').notNull(),
  link: text('link').notNull(),
  
  // Usage stats
  clicks: integer('clicks').default(0),
  conversions: integer('conversions').default(0),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Influencer submissions table (for cashback claims)
export const influencerSubmissions = pgTable('influencer_submissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  influencerId: uuid('influencer_id').notNull().references(() => influencers.id, { onDelete: 'cascade' }),
  referralId: uuid('referral_id').references(() => influencerReferrals.id, { onDelete: 'set null' }),
  
  // Submission details
  screenshot: text('screenshot').notNull(), // URL to uploaded image
  storyLink: text('story_link'), // Link to social media post
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  
  // Status
  status: text('status').default('pending'), // pending, approved, rejected
  
  // Review details
  reviewedBy: uuid('reviewed_by').references(() => users.id, { onDelete: 'set null' }),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true }),
  reviewNotes: text('review_notes'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
