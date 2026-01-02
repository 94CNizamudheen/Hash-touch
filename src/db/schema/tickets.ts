import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const ticketsSqlite = sqliteTable("tickets", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),

  // Ticket data stored as JSONclick the 
  ticketData: text("ticket_data").notNull(), // Stringified TicketRequest

  // Sync status
  syncStatus: text("sync_status").notNull().default("PENDING"), // PENDING, SYNCING, SYNCED, FAILED
  syncError: text("sync_error"),
  syncAttempts: integer("sync_attempts").default(0),

  // Metadata
  locationId: text("location_id"),
  orderModeName: text("order_mode_name"),
  ticketAmount: integer("ticket_amount"),
  itemsCount: integer("items_count"),
  queueNumber: integer("queue_number"),
  ticketNumber: integer("ticket_number"),

  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  syncedAt: text("synced_at"),
});
