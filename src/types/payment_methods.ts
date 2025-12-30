export interface PaymentMethod {
  id: string;
  code: string | null;
  name: string;
  processor: string | null;
  active: number;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
  deleted_at?: string | null;
  created_by?: string | null;
  updated_by?: string | null;
  deleted_by?: string | null;
}

export interface DbPaymentMethod {
  id: string;
  code?: string;
  name: string;
  processor?: string;
  active: number;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
  created_by?: string;
  updated_by?: string;
  deleted_by?: string;
}
