import { invoke } from "@tauri-apps/api/core";
import type { DbPaymentMethod } from "@/types/payment_methods";

export const paymentMethodLocal = {
  savePaymentMethods(items: DbPaymentMethod[]) {
    console.log("📤 paymentMethodLocal.savePaymentMethods called with", items.length, "items");
    return invoke("save_payment_methods", { items });
  },

  getAllPaymentMethods(): Promise<DbPaymentMethod[]> {
    return invoke("get_payment_methods");
  },

  clearCache(): Promise<void> {
    return invoke("clear_payment_methods_cache");
  },
};
