
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
}

export const productLocal = {
  save(items: DbProduct[]) {
    return invoke("save_products", { items });
  },
  getAll():Promise<DbProduct[]> {
    return invoke("get_products");
  },
};
