
import { invoke } from "@tauri-apps/api/core";

export interface ProductTagOption {
  id: string;
  product_id: string;
  name: string;
  price: number;
}

export interface ProductTagGroupUI {
  id: string;
  name: string;
  min_items: number;
  max_items: number;
  options: ProductTagOption[];
}

export interface ProductWithCombinations {
  id: string;
  name: string;
  price: number;
  description?: string;
  media?: string;
  combinations: ProductTagGroupUI[];
}

export function getProductWithCombinations(
  productId: string
): Promise<ProductWithCombinations> {
  return invoke("get_product_with_combinations", { productId });
}
