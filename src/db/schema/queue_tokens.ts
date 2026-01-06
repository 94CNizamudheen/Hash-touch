

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const queueTokensSqlite = sqliteTable("queue_tokens", {
  id: text("id").primaryKey(),

  ticketId: text("ticket_id").notNull(),
  ticketNumber: text("ticket_number").notNull(),

  tokenNumber: integer("token_number").notNull(),

  status: text("status", {
    enum: ["WAITING", "CALLED", "SERVED"],
  })
    .notNull()
    .default("WAITING"),

  source: text("source"), // POS | KDS

  locationId: text("location_id"),
  orderMode: text("order_mode"),

  createdAt: text("created_at")
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),

  calledAt: text("called_at"),
  servedAt: text("served_at"),
});
