
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const appStateSqlite = sqliteTable("app_state", {
  id: integer("id").primaryKey(), // always 1

  tenantDomain: text("tenant_domain"),
  accessToken: text("access_token"),

  selectedLocationId: text("selected_location_id"),
  brandId: text("brand_id"),
  orderModeNames: text("order_mode_names").default("[]"),
  orderModeIds: text("order_mode_ids").default("[]"),
  
  selectedOrderModeId: text("selected_order_mode_id"),
  selectedOrderModeName: text("selected_order_mode_name"),

  selectedLocationName: text("selected_location_name"),
  deviceRole: text("device_role", {
    enum: ["POS", "KIOSK", "QUEUE", "KDS"],
  }),

  syncStatus: text("sync_status", {
    enum: ["IDLE", "SYNCING", "DONE", "FAILED"],
  }).default("IDLE"),

  theme: text("theme").default("light"),
  language: text("language").default("en"),

  // KDS Settings
  kdsViewMode: text("kds_view_mode").default("grid"),
  kdsSettings: text("kds_settings").default("{}"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .default(sql`CURRENT_TIMESTAMP`),
});
