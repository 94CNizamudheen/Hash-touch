
export interface ProductOverride {
  key: string; 
  price?: string | number;
  name?: string;
  description?: string;
  code?: string;
  active?: boolean;
  media?: any; 
}

export interface Product {
  id: string;
  name: string;
  code?: string;
  description?: string;
  category_id?: string;
  price: number;
  active: boolean;
  sort_order: number;
  is_sold_out?: number;
  media?: string;
  overrides?: string | ProductOverride[];
}

export interface Category {
  id: string;
  name: string;
  code?: string;
  active: number;
  sort_order: number;
  media?: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}
export interface ProductGroup {
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

export interface ProductWithCombinations extends Product {
  combinations: ProductTagGroupUI[];
}
export interface ProductGroupCategory {
  id: string;

  product_group_id: string;

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

export interface ProductWithParsedOverrides extends Omit<Product, 'overrides'> {
  overrides: ProductOverride[];
}