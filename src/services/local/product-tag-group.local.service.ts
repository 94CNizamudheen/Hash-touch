
import { invoke } from "@tauri-apps/api/core";

export interface DbProductTagGroup {
  id: string;

  product_id: string;

  name: string;

  min_items: number;
  max_items: number;

  active: number;
  sort_order: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const productTagGroupLocal = {
  save(items: DbProductTagGroup[]) {
    return invoke("save_product_tag_groups", { items });
  },

  getAll(): Promise<DbProductTagGroup[]> {
    return invoke("get_product_tag_groups");
  },

  getByProduct(productId: string): Promise<DbProductTagGroup[]> {
    return invoke("get_product_tag_groups_by_product", {
      productId,
    });
  },
};
