import { sql } from 'drizzle-orm'
import { pgTable, text, integer, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core'

export const traits = pgTable('traits', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull(), // SVG content
  breakpoints: jsonb('breakpoints').notNull().$type<Array<{ num: number; color: string }>>(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const units = pgTable('units', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  cost: integer('cost').notNull(),
  image: text('image').notNull(), // Base64 image
  traits: jsonb('traits').notNull().$type<string[]>(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const components = pgTable('components', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  image: text('image').notNull(), // Base64 image
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const items = pgTable('items', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull().$type<'standard' | 'emblem' | 'artifact' | 'other'>(),
  image: text('image').notNull(), // Base64 image
  recipe: jsonb('recipe').$type<string[] | null>(), // Component IDs
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  isAdmin: boolean('is_admin').default(false).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export const compositions = pgTable('compositions', {
  id: text('id').primaryKey(),
  userId: text('user_id').references(() => users.id),
  addedBy: text('added_by').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  units: jsonb('units').notNull().$type<Array<{unitId: string, items: string[], position: number}>>(),
  rating: text('rating').$type<'S' | 'A' | 'B' | 'C'>(),
  isPublic: boolean('is_public').default(false).notNull(),
  createdAt: timestamp('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: timestamp('updated_at').default(sql`CURRENT_TIMESTAMP`)
})

export type Trait = typeof traits.$inferSelect
export type NewTrait = typeof traits.$inferInsert
export type Unit = typeof units.$inferSelect
export type NewUnit = typeof units.$inferInsert
export type Component = typeof components.$inferSelect
export type NewComponent = typeof components.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Composition = typeof compositions.$inferSelect
export type NewComposition = typeof compositions.$inferInsert