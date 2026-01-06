export type KdsStatus = "COMPLETED" | "IN_PROGRESS" | "READY";

export interface KDSTicketData {
  id: string;
  ticketNumber: string;
  orderId?: string;
  locationId?: string;
  orderModeName?: string;
  status: KdsStatus;
  items: string; // JSON stringified array
  totalAmount?: number;
  tokenNumber?: number;
  createdAt: string;
  updatedAt: string;
}

export interface KDSTicketItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  modifiers?: Array<{ name: string; price: number }>;
  completed?: boolean;
  notes?: string;
}
