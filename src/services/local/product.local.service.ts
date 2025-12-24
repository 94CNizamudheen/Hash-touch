
import { invoke } from "@tauri-apps/api/core";

export interface DbProduct {
    id:string;
    name:string;
    code?:string;
    description?:string;
    category_id?:string;
    price:number;
    active:boolean;
    sort_order:number;
    media?:string;
    overrides?:string;
}

export const productLocal = {
  save(items: DbProduct[]) {
    console.log("📤 productLocal.save called with", items.length, "items");

    // Debug: Check if items have overrides before sending to Rust
    const withOverrides = items.filter(p => {
      try {
        const parsed = typeof p.overrides === 'string' ? JSON.parse(p.overrides) : p.overrides;
        return parsed && Array.isArray(parsed) && parsed.length > 0;
      } catch {
        return false;
      }
    });

    console.log(`📤 Items with overrides before Rust invoke: ${withOverrides.length} / ${items.length}`);

    if (withOverrides.length > 0) {
      const sample = withOverrides[0];
      console.log(`📤 Sample item being sent to Rust:`, {
        name: sample.name,
        price: sample.price,
        overrides: sample.overrides,
        overrides_type: typeof sample.overrides,
        overrides_length: sample.overrides?.length
      });
    }

    return invoke("save_products", { items });
  },
  getAll():Promise<DbProduct[]> {
    return invoke("get_products");
  },
  clearCache():Promise<void>{
    return invoke("clear_products_cache")
  }
};
