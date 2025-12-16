
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const deviceProfilesSqlite = sqliteTable("device_profiles", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),
  name: text("name").notNull(),
  role: text("role", { enum: ["POS", "KIOSK", "QUEUE", "KDS"] }).notNull(),
  config: text("config"),
  syncStatus: text("sync_status", { enum: ["PENDING", "SYNCED", "FAILED"] }).default("PENDING"),
  createdAt: integer("created_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  updatedAt: integer("updated_at", { mode: "timestamp" }).default(sql`CURRENT_TIMESTAMP`),
  lastSyncAt: integer("last_sync_at", { mode: "timestamp" }),
});
