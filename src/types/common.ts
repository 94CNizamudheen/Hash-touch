/* eslint-disable @typescript-eslint/no-explicit-any */

export type DeviceRole = "POS" | "KIOSK" | "QUEUE" | "KDS";
export type SyncStatus = "PENDING" | "SYNCED" | "FAILED";
export type OrderStatus = "PLACED" | "PAID" | "READY" | "COMPLETED" | "CANCELLED";
export type QueueStatus = "WAITING" | "CALLED" | "SERVED";
export type KdsStatus = "PENDING" | "IN_PROGRESS" | "READY";
export type PaymentMethod =  "CASH"  | "CREDIT_CARD"  | "E_WALLET"  | "BANK_TRANSFER"  | "CRM_POINTS"  | "TABSQUARE"  | "QUICK_DINE"  | "MALL_VOUCHER"  | "STRIPE";
export type PrinterTypes=  "network"| "usb" ;

export interface DeviceProfile {
  id: string;
  name: string;
  role: DeviceRole;
  config?: string | null;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type NewDeviceProfile = Omit<DeviceProfile, "id" | "createdAt" | "updatedAt" | "syncStatus">;


export interface Order {
  id: string;
  deviceId?: string | null;
  status: OrderStatus;
  total: number;
  paymentMethod?: PaymentMethod | null;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type NewOrder = Omit<Order, "id" | "createdAt" | "updatedAt" | "syncStatus">;


export interface OrderItem {
  id: string;
  orderId: string;
  menu_item_id: string;
  quantity: number;
  price: number;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type NewOrderItem = Omit<OrderItem, "id" | "createdAt" | "updatedAt" | "syncStatus">;

export interface QueueToken {
  id: string;
  order_id: string;
  token_number: number;
  status: QueueStatus;
  syncStatus?: SyncStatus;
  created_at: Date;
  updated_at: Date;
}
export type NewQueueToken = Omit<QueueToken, "id" | "createdAt" | "updatedAt" | "syncStatus">;


export interface KDSTicket {
  id: string;
  order_id: string;
  status: KdsStatus;
  syncStatus: SyncStatus;
  created_at: Date;
  updated_at: Date;
}

export interface KDSTicketWithToken {
  id: string;
  order_id: string;
  status: string;
  token_number: number;
  token_status:QueueStatus,
  created_at?:  Date;
  updated_at?:  Date;
}

export type NewKDSTicket = Omit<KDSTicket, "id" | "createdAt" | "updatedAt" | "syncStatus">;

export interface MenuItem {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  category_id?: string | null;
  image_url?: string | null;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface MenuCategory {
  id: string;
  name: string;
  sort_order?: number;
  is_active?: boolean;
}

export type NewMenuItem = Omit<MenuItem, "id" | "createdAt" | "updatedAt" | "syncStatus">;

export interface MenuModifier {
  id: string;
  itemId: string;
  name: string;
  priceDelta: number;
  syncStatus: SyncStatus;
  createdAt: Date;
  updatedAt: Date;
}
export type NewMenuModifier = Omit<MenuModifier, "id" | "createdAt" | "updatedAt" | "syncStatus">;

export interface DailySales {
  total: number;
  orders: number;
}

export interface TopMenuItem {
  item: string;
  count: number;
}

export interface DeviceUsage {
  device_id: string;
  orders: number;
}
export interface SyncResult {
  success: boolean;
  message: string;
}


export interface DetailedOrderItem extends Omit<OrderItem, "syncStatus" | "createdAt" | "updatedAt"> {
  created_at: string;
  updated_at: string;
  menuItem?: MenuItem | null;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image_url?: string | null;
   modifiers?: { name: string; qty: number; price: number }[];
}

export interface Notification {
  id: number;
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
}
export interface NotificationContextType {
  showNotification: {
    success: (msg: string, duration?: number) => void;
    error: (msg: string, duration?: number) => void;
    warning: (msg: string, duration?: number) => void;
    info: (msg: string, duration?: number) => void;
  };
}
export interface OrderReadyPayload {
  order_id: string;
  token?: string;
  message?: string;
  sender?: string; 
}

export interface User {
  id: string;
  username: string;
  role: string;
  language:string;
  branchId?: string | null;
  pinCode?: string | null;
  isActive?: number; 
  lastLogin?: string | null; 
}

export interface PosSession {
  id: string;
  staffId: string;
  branchId?: string | null;
  startedAt: string;
  endedAt?: string | null;
  floatAmount: number;
  status: "ACTIVE" | "CLOSED";
  isActive: number;
}
export interface StaffShift {
  id: string;
  staffId: string;
  branchId?: string | null;
  startTime: string;
  endTime?: string | null;
  floatAmount: number;
  status: "ACTIVE" | "CLOSED";
  isActive: number;
}

export interface AutomationButton {
  id: number;
  name: string;
  label: string;
  icon?: string | null;

  event_name: string;    // matches Rust column event_name
  ui_area: string;       // matches ui_area in DB

  sort_order: number;
  is_active: number;     // 1 | 0
  style_class:string;
  // event_payload will come from DB as JSON string → FE converts to object
  event_payload?: Record<string, any> | null;
}



export interface PrinterSetting{
  id:number,
  name:string,
  printer_type:PrinterTypes,
  ip_address:string,
  port:number,
  is_active:number,
  created_at?:Date,
  updated_at?:Date,

} 