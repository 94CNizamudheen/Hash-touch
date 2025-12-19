
import { invoke } from "@tauri-apps/api/core";

export interface DbProductGroup {
  id: string;

  name: string;
  code?: string;
  description?: string;

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

export const productGroupLocal = {
  save(items: DbProductGroup[]) {
    return invoke("save_product_groups", { items });
  },

  getAll(): Promise<DbProductGroup[]> {
    return invoke("get_product_groups");
  },
};
