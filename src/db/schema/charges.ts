import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";
import { v4 as uuidv4 } from "uuid";

export const chargesSqlite = sqliteTable("charges", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),

  code: text("code"),
  name: text("name").notNull(),
  percentage: text("percentage"),
  isTax: integer("is_tax").default(0),

  transactionTypeId: text("transaction_type_id"),
  parentChargeId: text("parent_charge_id"),

  active: integer("active").default(1),
  sortOrder: integer("sort_order").default(0),

  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),

  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
});

export const chargeMappingsSqlite = sqliteTable("charge_mappings", {
  id: text("id").primaryKey().$defaultFn(() => uuidv4()),

  chargeId: text("charge_id").notNull(),
  categoryId: text("category_id"),
  productId: text("product_id"),
  productGroupId: text("product_group_id"),

  active: integer("active").default(1),
  sortOrder: integer("sort_order").default(0),

  createdAt: text("created_at"),
  updatedAt: text("updated_at"),
  deletedAt: text("deleted_at"),

  createdBy: text("created_by"),
  updatedBy: text("updated_by"),
  deletedBy: text("deleted_by"),
});
