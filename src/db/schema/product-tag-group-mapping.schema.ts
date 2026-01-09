
// product-tag-group-mapping.schema.ts
import { sqliteTable, text, primaryKey } from "drizzle-orm/sqlite-core";
import { productSqlite } from "./product"; 
import { productTagGroupSqlite } from "./product_tag_groups"; 

export const productTagGroupMappingSqlite = sqliteTable(
  "product_tag_group_mappings",
  {
    productId: text("product_id")
      .notNull()
      .references(() => productSqlite.id),
    tagGroupId: text("tag_group_id")
      .notNull()
      .references(() => productTagGroupSqlite.id),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.productId, table.tagGroupId] }),
  })
);