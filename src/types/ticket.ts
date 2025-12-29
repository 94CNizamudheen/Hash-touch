export interface TicketState {
  submitted: boolean;
  closed: boolean;
  void: boolean;
}

export interface OrderState {
  submitted: boolean;
  gift: boolean;
  void: boolean;
  comp: boolean;
  return: boolean;
  refund: boolean;
}

export interface ChannelUser {
  created_by: string;
}

export interface Ticket {
  channel_name: string;
  ticket_number: number;
  location_id: string;
  invoice_number: string;
  ticket_amount: number;
  tax_inclusive: boolean;
  ordermode_name: string;
  ticket_tags?: Record<string, any>;
  ticket_state: TicketState;
  queue_number?: number;
  extra_data?: {
    location_code?: string;
    location_name?: string;
    [key: string]: any;
  };
  business_date: string;
  ticket_created_time: string;
  ticket_updated_time: string;
  last_order_time?: string;
  last_payment_date?: string;
  last_payment_time?: string;
  delivery_date?: string;
  delivery_time?: string;
}

export interface Order {
  location_id: string;
  product_name: string;
  quantity: number;
  order_price: string;
  ordermode_name: string;
  tax_inclusive: boolean;
  tax_amount: string;
  tax_detail?: Record<string, any>;
  sort_order: number;
  parent_sort_order: number;
  net_amount: string;
  charge_amount: string;
  charge_details?: Record<string, any>;
  order_state: OrderState;
  channel_user: ChannelUser;
  extra_data?: Record<string, any>;
  business_date: string;
  order_date: string;
  order_time: string;
}

export interface Payment {
  payment_type_id: string;
  payment_type: string;
  payment_amount: string;
  tip_amount: string;
  tendered_amount: string;
  net_amount: string;
  currency: string;
  currency_exchange_rate: string;
  tags?: Record<string, any>;
  terminal?: string;
  channel_user: ChannelUser;
  payment_date: string;
  payment_time: string;
}

export interface Transaction {
  transaction_type_name: string;
  amount: string;
  transaction_time: string;
  transaction_type_id: string;
}

export interface TicketRequest {
  ticket: Ticket;
  orders: Order[];
  payments: Payment[];
  transactions: Transaction[];
}
