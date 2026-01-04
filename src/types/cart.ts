export interface CartItem {
  id: string;
  product_id?: string;
  name: string;
  price: number;
  quantity: number;
  category_id?: string | null;
  product_group_id?: string | null;
  image_url?: string | null;
  modifiers?: { name: string; qty: number; price: number }[];
  notes?:string;
}
