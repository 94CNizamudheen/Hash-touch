
import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const productTagSqlite = sqliteTable(
  "product_tags",
  {
    id: text("id").primaryKey(),

    tagGroupId: text("tag_group_id").notNull(), // FK → product_tag_groups.id
    productId: text("product_id").notNull(),   // FK → products.id

    name: text("name").notNull(),
    price: real("price").default(0),

    active: integer("active").default(1),
    sortOrder: integer("sort_order").default(0),

    createdAt: text("created_at"),
    updatedAt: text("updated_at"),
    deletedAt: text("deleted_at"),
  }
);
