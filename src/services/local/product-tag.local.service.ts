import { invoke } from "@tauri-apps/api/core";

export interface DbProductTag {
  id: string;

  tag_group_id: string; // FK → product_tag_groups.id
  product_id: string;   // FK → products.id

  name: string;
  price: number;

  active: number;
  sort_order: number;

  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}

export const productTagLocal = {
  save(items: DbProductTag[]) {
    return invoke("save_product_tags", { items });
  },

  getAll(): Promise<DbProductTag[]> {
    return invoke("get_product_tags");
  },

  getByTagGroup(tagGroupId: string): Promise<DbProductTag[]> {
    return invoke("get_product_tags_by_group", {
      tagGroupId,
    });
  },
};
