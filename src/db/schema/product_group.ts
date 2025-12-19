import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const productGroupSqlite = sqliteTable("product_groups", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),

  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),

  active: integer("active").default(1),
  sortOrder: integer("sort_order").default(0),

  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),

  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),

  media: text("media"), // JSON
});
