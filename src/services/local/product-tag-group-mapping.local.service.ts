import { invoke } from "@tauri-apps/api/core";

export interface ProductTagGroupMapping {
  product_id: string;
  tag_group_id: string;
}

export const productTagGroupMappingLocal = {
  save(items: ProductTagGroupMapping[]) {
    return invoke("save_product_tag_group_mappings", { items });
  },
};
