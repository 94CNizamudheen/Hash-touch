import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const printers = sqliteTable("printers", {
  id: text("id").primaryKey().notNull(),
  name: text("name").notNull(),
  printer_type: text("printer_type").notNull(), // "network", "usb", "bluetooth"
  ip_address: text("ip_address"),
  port: integer("port"),
  is_active: integer("is_active").default(0).notNull(),
  created_at: text("created_at"),
  updated_at: text("updated_at"),
});
