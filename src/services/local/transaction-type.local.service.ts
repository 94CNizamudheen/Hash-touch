import { invoke } from "@tauri-apps/api/core";
import type { DbTransactionType } from "@/types/transaction-type";

export const transactionTypeLocal = {
  saveTransactionTypes(items: DbTransactionType[]) {
    console.log("📤 transactionTypeLocal.saveTransactionTypes called with", items.length, "items");
    return invoke("save_transaction_types", { items });
  },

  getAllTransactionTypes(): Promise<DbTransactionType[]> {
    return invoke("get_transaction_types");
  },

  clearCache(): Promise<void> {
    return invoke("clear_transaction_types_cache");
  },
};
