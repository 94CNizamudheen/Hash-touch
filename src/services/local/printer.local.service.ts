import { invoke } from "@tauri-apps/api/core";

export interface Printer {
  id: string;
  name: string;
  printer_type: string; // "network", "usb", "bluetooth"
  ip_address?: string;
  port?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total: number;
}

export interface ReceiptCharge {
  name: string;
  amount: number;
}

export interface ReceiptData {
  ticket_number: string;
  location_name: string;
  order_mode: string;
  items: ReceiptItem[];
  subtotal: number;
  charges: ReceiptCharge[];
  total: number;
  payment_method: string;
  tendered: number;
  change: number;
  timestamp: string;
}

export const printerService = {
  async getAllPrinters(): Promise<Printer[]> {
    return invoke("get_printers");
  },

  async getActivePrinters(): Promise<Printer[]> {
    return invoke("get_active_printers");
  },

  async getPrinter(id: string): Promise<Printer | null> {
    return invoke("get_printer", { id });
  },

  async savePrinter(printer: Printer): Promise<void> {
    return invoke("save_printer", { printer });
  },

  async deletePrinter(id: string): Promise<void> {
    return invoke("delete_printer", { id });
  },

  async setPrinterActive(id: string, isActive: boolean): Promise<void> {
    return invoke("set_printer_active", { id, isActive });
  },

  async testPrinter(printer: Printer): Promise<void> {
    return invoke("test_printer", { printer });
  },

  async printReceipt(printerId: string, receiptData: ReceiptData): Promise<void> {
    return invoke("print_receipt", { printerId, receiptData });
  },

  async printReceiptToAllActive(receiptData: ReceiptData): Promise<void> {
    return invoke("print_receipt_to_all_active", { receiptData });
  },
};
