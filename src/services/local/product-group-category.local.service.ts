
import { invoke } from "@tauri-apps/api/core";

export interface DbProductGroupCategory {
  id: string;

  product_group_id: string;

  name: string;
  code?: string;

  active: number;
  sort_order: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;

  created_by?: string;
  updated_by?: string;
  deleted_by?: string;

  media?: string;
}

export const productGroupCategoryLocal = {
  save(items: DbProductGroupCategory[]) {
    return invoke("save_product_group_categories", { items });
  },

  getAll(): Promise<DbProductGroupCategory[]> {
    return invoke("get_product_group_categories");
  },
};
