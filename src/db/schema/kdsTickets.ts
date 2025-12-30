import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const kdsTicketsSqlite = sqliteTable("kds_tickets", {
  // Primary Key
  id: text("id").primaryKey(),

  // Core Ticket Data
  ticketNumber: text("ticket_number").notNull(),
  orderId: text("order_id"),
  locationId: text("location_id"),
  orderModeName: text("order_mode_name"),

  // KDS Status
  status: text("status", {
    enum: ["PENDING", "IN_PROGRESS", "READY"],
  })
    .notNull()
    .default("PENDING"),

  // Order Items (JSON stringified array)
  items: text("items").notNull(),

  // Financial Data
  totalAmount: integer("total_amount"),

  // Queue Integration
  tokenNumber: integer("token_number"),

  // Timestamps
  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
});
