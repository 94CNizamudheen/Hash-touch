import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const productGroupCategorySqlite = sqliteTable(
  "product_group_categories",
  {
    id: text("id").primaryKey().$defaultFn(() => uuidv4()),

    productGroupId: text("product_group_id").notNull(),

    name: text("name").notNull(),
    code: text("code"),

    active: integer("active").default(1),
    sortOrder: integer("sort_order").default(0),

    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),

    createdBy: text("created_by"),
    updatedBy: text("updated_by"),
    deletedBy: text("deleted_by"),

    media: text("media"),
  }
);
