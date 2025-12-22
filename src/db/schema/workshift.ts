


import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const workShiftDraft = sqliteTable("work_shift_draft", {
  id: integer("id").primaryKey(), 
  data: text("data").notNull(),
  updatedAt: text("updated_at"),
});
