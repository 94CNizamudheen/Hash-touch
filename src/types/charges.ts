export interface ChargeMapping {
  id: string;
  charge_id: string;
  category_id: string | null;
  product_id: string | null;
  product_group_id: string | null;
  active: number;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
}

export interface Charge {
  id: string;
  code: string | null;
  name: string;
  percentage: string | null;
  is_tax: number;
  transaction_type_id: string | null;
  parent_charge_id: string | null;
  active: number;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
  mappings?: ChargeMapping[];
}

export interface DbCharge {
  id: string;
  code?: string;
  name: string;
  percentage?: string;
  is_tax: number;
  transaction_type_id?: string;
  parent_charge_id?: string;
  active: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}

export interface DbChargeMapping {
  id: string;
  charge_id: string;
  category_id?: string;
  product_id?: string;
  product_group_id?: string;
  active: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}
