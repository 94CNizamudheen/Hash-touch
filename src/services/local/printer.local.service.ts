import { invoke } from "@tauri-apps/api/core";

export interface Printer {
  id: string;
  name: string;
  printer_type: string; // "network", "usb", "bluetooth", "builtin"
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

// Built-in Printer Detection Result (from Android)
export interface BuiltinPrinterDetection {
  available: boolean;
  type: string;
  deviceName: string;
  vendorId: number;
  productId: number;
  manufacturer: string;
  model: string;
  error?: string;
}

// Built-in Printer Bridge Result
interface BuiltinPrinterResult {
  success: boolean;
  error?: string;
}

// Declare the Android JavaScript interface
declare global {
  interface Window {
    BuiltinPrinter?: {
      isAvailable: () => string;
      detect: () => string;
      printEscPos: (base64Data: string) => string;
      printTest: () => string;
      connect: () => string;
      disconnect: () => string;
    };
  }
}

// ESC/POS Command Constants
const ESC_POS = {
  INIT: [0x1b, 0x40],
  BOLD_ON: [0x1b, 0x45, 0x01],
  BOLD_OFF: [0x1b, 0x45, 0x00],
  DOUBLE_HEIGHT_ON: [0x1d, 0x21, 0x11],
  DOUBLE_SIZE_ON: [0x1d, 0x21, 0x33],
  NORMAL_SIZE: [0x1d, 0x21, 0x00],
  ALIGN_LEFT: [0x1b, 0x61, 0x00],
  ALIGN_CENTER: [0x1b, 0x61, 0x01],
  LINE_FEED: [0x0a],
  CUT_PAPER: [0x1d, 0x56, 0x00],
};

/**
 * Build ESC/POS receipt commands from receipt data
 */
function buildReceiptEscPos(receipt: ReceiptData): Uint8Array {
  const commands: number[] = [];

  // Initialize
  commands.push(...ESC_POS.INIT);

  // Header - Location Name (centered, double size)
  commands.push(...ESC_POS.ALIGN_CENTER);
  commands.push(...ESC_POS.DOUBLE_SIZE_ON);
  commands.push(...new TextEncoder().encode(receipt.location_name));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.NORMAL_SIZE);
  commands.push(...ESC_POS.LINE_FEED);

  // Ticket Number (centered, bold)
  commands.push(...ESC_POS.BOLD_ON);
  commands.push(...new TextEncoder().encode(`Ticket: ${receipt.ticket_number}`));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.BOLD_OFF);

  // Order Mode
  commands.push(...new TextEncoder().encode(`Mode: ${receipt.order_mode}`));
  commands.push(...ESC_POS.LINE_FEED);

  // Timestamp
  commands.push(...new TextEncoder().encode(receipt.timestamp));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.LINE_FEED);

  // Separator line
  commands.push(...ESC_POS.ALIGN_LEFT);
  commands.push(...new TextEncoder().encode("--------------------------------"));
  commands.push(...ESC_POS.LINE_FEED);

  // Items
  for (const item of receipt.items) {
    const line = `${item.name} x${item.quantity} @ $${item.price.toFixed(2)}  $${item.total.toFixed(2)}`;
    commands.push(...new TextEncoder().encode(line));
    commands.push(...ESC_POS.LINE_FEED);
  }

  commands.push(...new TextEncoder().encode("--------------------------------"));
  commands.push(...ESC_POS.LINE_FEED);

  // Subtotal
  commands.push(...new TextEncoder().encode(`Subtotal:              $${receipt.subtotal.toFixed(2)}`));
  commands.push(...ESC_POS.LINE_FEED);

  // Charges (tax, fees, etc.)
  for (const charge of receipt.charges) {
    commands.push(...new TextEncoder().encode(`${charge.name}:              $${charge.amount.toFixed(2)}`));
    commands.push(...ESC_POS.LINE_FEED);
  }

  commands.push(...new TextEncoder().encode("--------------------------------"));
  commands.push(...ESC_POS.LINE_FEED);

  // Total (bold, larger)
  commands.push(...ESC_POS.BOLD_ON);
  commands.push(...ESC_POS.DOUBLE_HEIGHT_ON);
  commands.push(...new TextEncoder().encode(`TOTAL: $${receipt.total.toFixed(2)}`));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.NORMAL_SIZE);
  commands.push(...ESC_POS.BOLD_OFF);

  commands.push(...new TextEncoder().encode("--------------------------------"));
  commands.push(...ESC_POS.LINE_FEED);

  // Payment info
  commands.push(...new TextEncoder().encode(`Payment: ${receipt.payment_method}`));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...new TextEncoder().encode(`Tendered:              $${receipt.tendered.toFixed(2)}`));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...new TextEncoder().encode(`Change:                $${receipt.change.toFixed(2)}`));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.LINE_FEED);

  // Thank you message (centered)
  commands.push(...ESC_POS.ALIGN_CENTER);
  commands.push(...new TextEncoder().encode("Thank You!"));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...new TextEncoder().encode("Please Come Again"));
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.LINE_FEED);
  commands.push(...ESC_POS.LINE_FEED);

  // Cut paper
  commands.push(...ESC_POS.CUT_PAPER);

  return new Uint8Array(commands);
}

/**
 * Convert Uint8Array to base64
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export const printerService = {
  /**
   * Check if builtin printer is available (Android only)
   */
  isBuiltinPrinterAvailable(): boolean {
    if (typeof window !== "undefined" && window.BuiltinPrinter) {
      try {
        const result = window.BuiltinPrinter.isAvailable();
        return result === "true";
      } catch {
        return false;
      }
    }
    return false;
  },

  /**
   * Detect builtin printer details (Android only)
   */
  detectBuiltinPrinter(): BuiltinPrinterDetection | null {
    if (typeof window !== "undefined" && window.BuiltinPrinter) {
      try {
        const resultJson = window.BuiltinPrinter.detect();
        return JSON.parse(resultJson) as BuiltinPrinterDetection;
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * Print receipt via builtin printer (Android only)
   */
  async printReceiptBuiltin(receiptData: ReceiptData): Promise<void> {
    if (!window.BuiltinPrinter) {
      throw new Error("Built-in printer not available on this device");
    }

    const escPosCommands = buildReceiptEscPos(receiptData);
    const base64Data = uint8ArrayToBase64(escPosCommands);

    const resultJson = window.BuiltinPrinter.printEscPos(base64Data);
    const result: BuiltinPrinterResult = JSON.parse(resultJson);

    if (!result.success) {
      throw new Error(result.error || "Failed to print via built-in printer");
    }
  },

  /**
   * Test builtin printer (Android only)
   */
  async testBuiltinPrinter(): Promise<void> {
    if (!window.BuiltinPrinter) {
      throw new Error("Built-in printer not available on this device");
    }

    const resultJson = window.BuiltinPrinter.printTest();
    const result: BuiltinPrinterResult = JSON.parse(resultJson);

    if (!result.success) {
      throw new Error(result.error || "Failed to test built-in printer");
    }
  },

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
    // Use builtin printer path if type is "builtin"
    if (printer.printer_type === "builtin") {
      return this.testBuiltinPrinter();
    }
    return invoke("test_printer", { printer });
  },

  async printReceipt(printerId: string, receiptData: ReceiptData): Promise<void> {
    // Check if this is a builtin printer
    const printer = await this.getPrinter(printerId);
    if (printer?.printer_type === "builtin") {
      return this.printReceiptBuiltin(receiptData);
    }

    // Build ESC/POS commands in TypeScript
    const escPosCommands = buildReceiptEscPos(receiptData);
    const base64Data = uint8ArrayToBase64(escPosCommands);

    // Send raw data to Rust for network printing
    return invoke("print_raw", { printerId, data: base64Data });
  },

  async printReceiptToAllActive(receiptData: ReceiptData): Promise<void> {
    const activePrinters = await this.getActivePrinters();
    const errors: string[] = [];

    // Build ESC/POS commands once in TypeScript
    const escPosCommands = buildReceiptEscPos(receiptData);
    const base64Data = uint8ArrayToBase64(escPosCommands);

    // Print to builtin printer if available and active
    const builtinPrinter = activePrinters.find((p) => p.printer_type === "builtin");
    if (builtinPrinter) {
      try {
        await this.printReceiptBuiltin(receiptData);
      } catch (e) {
        errors.push(`Builtin: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // Print to network printers via Tauri (raw data, formatted by TS)
    const networkPrinters = activePrinters.filter((p) => p.printer_type === "network");
    if (networkPrinters.length > 0) {
      try {
        await invoke("print_raw_to_all_active", { data: base64Data });
      } catch (e) {
        errors.push(`Network: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // If no printers at all, still try (will error appropriately)
    if (!builtinPrinter && networkPrinters.length === 0 && activePrinters.length === 0) {
      return invoke("print_raw_to_all_active", { data: base64Data });
    }

    if (errors.length > 0) {
      throw new Error(`Print errors: ${errors.join("; ")}`);
    }
  },

  /**
   * Auto-setup builtin printer if detected (call on app startup for Android)
   */
  async autoSetupBuiltinPrinter(): Promise<Printer | null> {
    const detection = this.detectBuiltinPrinter();
    if (!detection?.available) {
      return null;
    }

    // Check if builtin printer already exists
    const existingPrinters = await this.getAllPrinters();
    const existingBuiltin = existingPrinters.find((p) => p.printer_type === "builtin");

    if (existingBuiltin) {
      return existingBuiltin;
    }

    // Create new builtin printer entry
    const builtinPrinter: Printer = {
      id: `builtin-${Date.now()}`,
      name: `Built-in Printer (${detection.manufacturer} ${detection.model})`,
      printer_type: "builtin",
      is_active: true,
    };

    await this.savePrinter(builtinPrinter);
    return builtinPrinter;
  },
};
