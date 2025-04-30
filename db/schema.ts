import { integer, text, boolean, pgTable, timestamp, varchar } from "drizzle-orm/pg-core";

export const campaigns = pgTable("campaigns", {
  id: integer("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const utmSources = pgTable("utm_sources", {
  id: integer("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const utmMediums = pgTable("utm_mediums", {
  id: integer("id").primaryKey().notNull(),
  name: varchar("name", { length: 255 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const utmUrls = pgTable("utm_urls", {
  id: integer("id").primaryKey().notNull(),
  baseUrl: text("base_url").notNull(),
  sourceId: integer("source_id").references(() => utmSources.id).notNull(),
  mediumId: integer("medium_id").references(() => utmMediums.id),
  campaignId: integer("campaign_id").references(() => campaigns.id),
  content: varchar("content", { length: 255 }),
  generatedUrl: text("generated_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
