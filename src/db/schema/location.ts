
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const location = sqliteTable("location", {
  id: text("server_id").primaryKey(),
  name: text("name").notNull(),
  active: integer("active").default(1),
  selected: integer("selected").default(0),
});
