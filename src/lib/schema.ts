import {
  pgTable,
  text,
  boolean,
  varchar,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const settings = pgTable('settings', {
  title: varchar('title', { length: 256 }).notNull(),
  logo: text('logo').notNull(),
  copyright: varchar('copyright', { length: 256 }).notNull(),
  searchEnabled: boolean('searchEnabled').default(true).notNull(),
  theme: varchar('theme', { length: 50 }).default('theme-blue').notNull(),
  appearanceMode: varchar('appearanceMode', { length: 50 }).default('light').notNull(),
});

export const categories = pgTable('categories', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  sortOrder: integer('sort_order').default(0).notNull(),
  isCollapsed: boolean('is_collapsed').default(false).notNull(),
});

export const links = pgTable('links', {
  id: varchar('id', { length: 128 }).primaryKey(),
  name: varchar('name', { length: 256 }).notNull(),
  url: text('url').notNull(),
  description: text('description').notNull(),
  logoUrl: text('logoUrl'),
  sortOrder: integer('sort_order').default(0).notNull(),
  categoryId: varchar('categoryId', { length: 128 })
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
});

export const adminConfig = pgTable('admin_config', {
  id: integer('id').primaryKey(),
  adminPasswordHash: text('adminPasswordHash').notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  links: many(links),
}));

export const linksRelations = relations(links, ({ one }) => ({
  category: one(categories, {
    fields: [links.categoryId],
    references: [categories.id],
  }),
}));

export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;

export type Category = typeof categories.$inferSelect;
export type NewCategory = typeof categories.$inferInsert;

export type Link = typeof links.$inferSelect;
export type NewLink = typeof links.$inferInsert;

export type AdminConfig = typeof adminConfig.$inferSelect;
export type NewAdminConfig = typeof adminConfig.$inferInsert;
