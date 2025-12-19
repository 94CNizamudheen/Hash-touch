import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const productSqlite = sqliteTable("products", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),

  name: text("name").notNull(),
  code: text("code"),
  description: text("description"),

  categoryId: text("category_id"),

  price: real("price").notNull(),
  active: integer("active").default(1),
  sortOrder: integer("sort_order").default(0),

  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),

  media: text("media"), 
});
