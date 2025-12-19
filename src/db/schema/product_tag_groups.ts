
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const productTagGroupSqlite = sqliteTable(
  "product_tag_groups",
  {
    id: text("id").primaryKey(),

    productId: text("product_id").notNull(), // FK → products.id

    name: text("name").notNull(),

    minItems: integer("min_items").default(0),
    maxItems: integer("max_items").default(0),

    active: integer("active").default(1),
    sortOrder: integer("sort_order").default(0),

    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),
  }
);
