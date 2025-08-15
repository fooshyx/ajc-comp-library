import { sql } from 'drizzle-orm'
import { pgTable, text, integer, jsonb, timestamp } from 'drizzle-orm/pg-core'

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

export type Trait = typeof traits.$inferSelect
export type NewTrait = typeof traits.$inferInsert
export type Unit = typeof units.$inferSelect
export type NewUnit = typeof units.$inferInsert
export type Component = typeof components.$inferSelect
export type NewComponent = typeof components.$inferInsert
export type Item = typeof items.$inferSelect
export type NewItem = typeof items.$inferInsert