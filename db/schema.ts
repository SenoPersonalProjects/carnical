import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const characters = sqliteTable("characters", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  ownerId: text("owner_id").notNull(),
  name: text("name").notNull().default("Sem nome"),
  concept: text("concept").notNull().default(""),
  clan: text("clan").notNull().default(""),
  sourcebook: text("sourcebook").notNull().default("core_v5_ptbr"),
  data: text("data").notNull().default("{}"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}, (table) => [index("idx_characters_owner_updated").on(table.ownerId, table.updatedAt)]);
