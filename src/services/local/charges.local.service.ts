import { invoke } from "@tauri-apps/api/core";
import type { DbCharge, DbChargeMapping } from "@/types/charges";

export const chargesLocal = {
  saveCharges(items: DbCharge[]) {
    console.log("📤 chargesLocal.saveCharges called with", items.length, "items");
    return invoke("save_charges", { items });
  },

  saveMappings(items: DbChargeMapping[]) {
    console.log("📤 chargesLocal.saveMappings called with", items.length, "items");
    return invoke("save_charge_mappings", { items });
  },

  getAllCharges(): Promise<DbCharge[]> {
    return invoke("get_charges");
  },

  getAllMappings(): Promise<DbChargeMapping[]> {
    return invoke("get_charge_mappings");
  },

  clearCache(): Promise<void> {
    return invoke("clear_charges_cache");
  },
};
