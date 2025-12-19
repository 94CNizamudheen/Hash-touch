
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const appStateSqlite = sqliteTable("app_state", {
  id: integer("id").primaryKey(), // always 1

  tenantDomain: text("tenant_domain"),
  accessToken: text("access_token"),

  selectedLocationId: text("selected_location_id"),
  brandId: text("brand_id"),

  orderModeIds: text("order_mode_ids").default("[]"), 
  
  deviceRole: text("device_role", {
    enum: ["POS", "KIOSK", "QUEUE", "KDS"],
  }),

  syncStatus: text("sync_status", {
    enum: ["IDLE", "SYNCING", "DONE", "FAILED"],
  }).default("IDLE"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),
});
