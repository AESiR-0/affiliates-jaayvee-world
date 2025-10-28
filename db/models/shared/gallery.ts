import { pgTable, uuid, text, timestamp, boolean, integer, real } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { users } from './user'

// Gallery Images - High-res photos from Talaash events
export const galleryImages = pgTable('gallery_images', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title').notNull(),
  description: text('description'),
  imageUrl: text('image_url').notNull(), // Full resolution image URL
  thumbnailUrl: text('thumbnail_url').notNull(), // Thumbnail for preview
  category: text('category').notNull(), // 'event', 'behind-scenes', 'performances', 'crowd', 'venue'
  eventId: uuid('event_id'), // Optional: link to specific event
  photographer: text('photographer'), // Photographer credit
  tags: text('tags'), // Comma-separated tags
  fileSize: integer('file_size'), // File size in bytes
  dimensions: text('dimensions'), // e.g., "1920x1080"
  isActive: boolean('is_active').default(true).notNull(),
  isFeatured: boolean('is_featured').default(false).notNull(),
  downloadCount: integer('download_count').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// Gallery Downloads - Track who downloaded what
export const galleryDownloads = pgTable('gallery_downloads', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  imageId: uuid('image_id').notNull().references(() => galleryImages.id, { onDelete: 'cascade' }),
  downloadType: text('download_type').notNull(), // 'thumbnail', 'high-res'
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  downloadedAt: timestamp('downloaded_at', { withTimezone: true }).defaultNow().notNull(),
})

// Gallery Categories - Organize images
export const galleryCategories = pgTable('gallery_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  description: text('description'),
  color: text('color').default('#00719C'), // Brand color
  isActive: boolean('is_active').default(true).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

// Relations
export const galleryImagesRelations = relations(galleryImages, ({ many }) => ({
  downloads: many(galleryDownloads),
}))

export const galleryDownloadsRelations = relations(galleryDownloads, ({ one }) => ({
  user: one(users, {
    fields: [galleryDownloads.userId],
    references: [users.id],
  }),
  image: one(galleryImages, {
    fields: [galleryDownloads.imageId],
    references: [galleryImages.id],
  }),
}))
