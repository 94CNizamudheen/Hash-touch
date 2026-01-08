


import { invoke } from "@tauri-apps/api/core";

/* =========================
   Types
========================= */

export interface DbSetup {
  id: string;
  code: string;
  name?: string | null;
  setup_type?: string | null;
  channel?: string | null;
  settings?: string | null;

  country_code?: string | null;
  currency_code?: string | null;
  currency_symbol?: string | null;

  active?: number | null;
  sort_order?: number | null;

  created_at?: string | null;
  updated_at?: string | null;
}

/* =========================
   Local Setup Service
========================= */

export const setupLocal = {
  /**
   * Save or update a setup locally (UPSERT)
   */
  save(setup: DbSetup): Promise<void> {
    return invoke("save_setup", { setup });
  },

  /**
   * Get setup by setup code
   */
  getByCode(code: string): Promise<DbSetup | null> {
    return invoke("get_setup_by_code", { code });
  },
};
