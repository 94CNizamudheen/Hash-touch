

import { invoke } from "@tauri-apps/api/core";

export interface DbCategory {
  id: string;
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

export const categoryLocal = {
  save(items: DbCategory[]) {
    return invoke("save_categories", { items });
  },

  getAll(): Promise<DbCategory[]> {
    return invoke("get_categories");
  },
};
