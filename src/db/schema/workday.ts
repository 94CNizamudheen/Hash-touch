

import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const workdays = sqliteTable("workdays", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  workdayId: text("workday_id"), // Server-side workday ID
  startUser: text("start_user"),
  endUser: text("end_user"),
  startTime: text("start_time"),
  endTime: text("end_time"),
  locationId: text("location_id").notNull(),
  totalSales: real("total_sales"),
  totalTaxes: real("total_taxes"),
  totalTicketCount: integer("total_ticket_count"),
  workPeriodInformations: text("work_period_informations"),
  departmentTicketInformations: text("department_ticket_informations"),
  addOn: text("add_on"),
  autoClosed: integer("auto_closed", { mode: "boolean" }),
  externalProcessed: integer("external_processed", { mode: "boolean" }),
  workPeriodDay: text("work_period_day"),
  businessDate: text("business_date"),
  syncStatus: text("sync_status").default("PENDING"), // PENDING, SYNCING, SYNCED, FAILED
  syncError: text("sync_error"),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at"),
});
