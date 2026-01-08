import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const setupsSqlite = sqliteTable("setups", {
  // Primary identifier from backend
  id: text("id").primaryKey(),

  // Setup identity
  code: text("code").notNull(),         // e.g. "touch"
  name: text("name"),                   // e.g. "Touch Setup"
  setupType: text("setup_type"),        // e.g. "Touch"
  channel: text("channel"),             // POS / KDS / QUEUE (if backend sends)

  // Core configuration (JSON string)
  settings: text("settings").default("{}"),

  // Meta
  active: integer("active").default(1),
  sortOrder: integer("sort_order").default(0),

  // Country / currency (flattened for SQLite)
  countryCode: text("country_code"),
  currencyCode: text("currency_code"),
  currencySymbol: text("currency_symbol"),

  // Audit
  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
});
