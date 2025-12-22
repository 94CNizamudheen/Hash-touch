
import { invoke } from "@tauri-apps/api/core";
import type { CartItem } from "@/types/common";

export const cartLocal = {
  async getDraft(): Promise<CartItem[] | null> {
    const res = await invoke<string | null>("get_cart_draft");
    return res ? (JSON.parse(res) as CartItem[]) : null;
  },

  async saveDraft(items: CartItem[]) {
    return invoke("save_cart_draft", {
      data: JSON.stringify(items),
    });
  },

  async clear() {
    return invoke("clear_cart_draft");
  },
};
