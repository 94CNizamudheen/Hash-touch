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

// Diagnostics types
export interface PrinterDiagnostics {
  device: {
    manufacturer: string;
    model: string;
    brand: string;
    device: string;
    product: string;
  };
  adapters: {
    sunmi: boolean;
    pax: boolean;
    intent: boolean;
    usb: boolean;
    serial: boolean;
  };
  printServices: Array<{
    action: string;
    package: string;
    name: string;
  }>;
  serialPorts: string[];
  error?: string;
}

export interface PrintServiceScan {
  allPrintRelated: string[];
  intentServices: string[];
  count: number;
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
      hasPermission: () => string;
      requestPermission: () => string;
      listUsbDevices: () => string;
      listSerialPorts: () => string;
      getDiagnostics: () => string;
      scanPrintServices: () => string;
    };
  }
}

const PAPER_WIDTH = 32; // 58mm printer (use 48 for 80mm)

const ESC_POS = {
  INIT: [0x1b, 0x40],
  ALIGN_LEFT: [0x1b, 0x61, 0x00],
  ALIGN_CENTER: [0x1b, 0x61, 0x01],
  BOLD_ON: [0x1b, 0x45, 0x01],
  BOLD_OFF: [0x1b, 0x45, 0x00],
  SIZE_NORMAL: [0x1d, 0x21, 0x00],
  SIZE_DOUBLE: [0x1d, 0x21, 0x11],
  FEED: [0x0a],
  CUT: [0x1d, 0x56, 0x00],
};

const encoder = new TextEncoder();

function line(text = ""): number[] {
  return [...encoder.encode(text), ...ESC_POS.FEED];
}

function center(text: string): number[] {
  return [
    ...ESC_POS.ALIGN_CENTER,
    ...encoder.encode(text),
    ...ESC_POS.FEED,
    ...ESC_POS.ALIGN_LEFT,
  ];
}

function hr(): number[] {
  return line("-".repeat(PAPER_WIDTH));
}

function padRight(text: string, width: number): string {
  return text.length > width ? text.substring(0, width) : text.padEnd(width);
}

function padLeft(text: string, width: number): string {
  return text.length > width ? text.substring(0, width) : text.padStart(width);
}

function formatItemRow(
  name: string,
  qty: number,
  price: number,
  total: number
): number[] {
  const nameW = 16;
  const qtyW = 4;
  const priceW = 6;
  const totalW = PAPER_WIDTH - (nameW + qtyW + priceW);

  const row =
    padRight(name, nameW) +
    padLeft(`x${qty}`, qtyW) +
    padLeft(price.toFixed(2), priceW) +
    padLeft(total.toFixed(2), totalW);

  return line(row);
}

function formatMoneyRow(label: string, value: number): number[] {
  const left = padRight(label, PAPER_WIDTH - 10);
  const right = padLeft(value.toFixed(2), 10);
  return line(left + right);
}
function buildReceiptEscPos(receipt: ReceiptData): Uint8Array {
  const cmd: number[] = [];

  cmd.push(...ESC_POS.INIT);

  // -------- HEADER --------
  cmd.push(...ESC_POS.SIZE_DOUBLE);
  cmd.push(...ESC_POS.BOLD_ON);
  cmd.push(...center(receipt.location_name));
  cmd.push(...ESC_POS.SIZE_NORMAL);
  cmd.push(...ESC_POS.BOLD_OFF);

  cmd.push(...center(`Ticket: ${receipt.ticket_number}`));
  cmd.push(...line(`Mode: ${receipt.order_mode}`));
  cmd.push(...line(receipt.timestamp));

  cmd.push(...hr());

  // -------- ITEMS HEADER --------
  cmd.push(...line("Item            Qty Price Total"));
  cmd.push(...hr());

  // -------- ITEMS --------
  receipt.items.forEach((item) => {
    cmd.push(
      ...formatItemRow(
        item.name,
        item.quantity,
        item.price,
        item.total
      )
    );
  });

  cmd.push(...hr());

  // -------- TOTALS --------
  cmd.push(...formatMoneyRow("Subtotal", receipt.subtotal));

  receipt.charges.forEach((charge) => {
    cmd.push(...formatMoneyRow(charge.name, charge.amount));
  });

  cmd.push(...hr());

  // -------- GRAND TOTAL --------
  cmd.push(...ESC_POS.BOLD_ON);
  cmd.push(...ESC_POS.SIZE_DOUBLE);
  cmd.push(...center(`TOTAL  ${receipt.total.toFixed(2)}`));
  cmd.push(...ESC_POS.SIZE_NORMAL);
  cmd.push(...ESC_POS.BOLD_OFF);

  cmd.push(...hr());

  // -------- PAYMENT --------
  cmd.push(...line(`Payment: ${receipt.payment_method}`));
  cmd.push(...formatMoneyRow("Tendered", receipt.tendered));
  cmd.push(...formatMoneyRow("Change", receipt.change));

  cmd.push(...ESC_POS.FEED);
  cmd.push(...ESC_POS.FEED);

  // -------- FOOTER --------
  cmd.push(...center("Thank You!"));
  cmd.push(...center("Please Come Again"));

  cmd.push(...ESC_POS.FEED);
  cmd.push(...ESC_POS.FEED);

  // -------- CUT --------
  cmd.push(...ESC_POS.CUT);

  return new Uint8Array(cmd);
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
   * List all USB devices for debugging (Android only)
   */
  listUsbDevices(): { count: number; devices: unknown[]; error?: string } | null {
    if (typeof window !== "undefined" && window.BuiltinPrinter?.listUsbDevices) {
      try {
        const resultJson = window.BuiltinPrinter.listUsbDevices();
        return JSON.parse(resultJson);
      } catch (e) {
        console.error("Failed to list USB devices:", e);
        return { count: 0, devices: [], error: e instanceof Error ? e.message : String(e) };
      }
    }
    return null;
  },

  /**
   * List available serial ports for debugging (Android only)
   */
  listSerialPorts(): { count: number; ports: string[]; error?: string } | null {
    if (typeof window !== "undefined" && window.BuiltinPrinter?.listSerialPorts) {
      try {
        const resultJson = window.BuiltinPrinter.listSerialPorts();
        return JSON.parse(resultJson);
      } catch (e) {
        console.error("Failed to list serial ports:", e);
        return { count: 0, ports: [], error: e instanceof Error ? e.message : String(e) };
      }
    }
    return null;
  },

  /**
   * Check if USB permission is granted (Android only)
   */
  hasBuiltinPrinterPermission(): boolean {
    if (typeof window !== "undefined" && window.BuiltinPrinter?.hasPermission) {
      try {
        const resultJson = window.BuiltinPrinter.hasPermission();
        const result = JSON.parse(resultJson);
        return result.granted === true;
      } catch {
        return false;
      }
    }
    return false;
  },

  /**
   * Request USB permission for builtin printer (Android only)
   */
  async requestBuiltinPrinterPermission(): Promise<boolean> {
    if (!window.BuiltinPrinter?.requestPermission) {
      throw new Error("Permission request not available on this device");
    }

    const resultJson = window.BuiltinPrinter.requestPermission();
    const result: BuiltinPrinterResult = JSON.parse(resultJson);

    if (!result.success) {
      throw new Error(result.error || "USB permission denied");
    }

    return true;
  },

  /**
   * Print receipt via builtin printer (Android only)
   */
  async printReceiptBuiltin(receiptData: ReceiptData): Promise<void> {
    if (!window.BuiltinPrinter) {
      throw new Error("Built-in printer not available");
    }

    // Detect printer first
    const detection = this.detectBuiltinPrinter();

    if (!detection?.available) {
      throw new Error("Built-in printer not detected");
    }

    // ONLY ask permission for USB printers
    if (detection.type === "usb_builtin") {
      if (!this.hasBuiltinPrinterPermission()) {
        await this.requestBuiltinPrinterPermission();
      }
    }

    // SERIAL printers DO NOT need permission

    const escPosCommands = buildReceiptEscPos(receiptData);
    const base64Data = uint8ArrayToBase64(escPosCommands);

    const resultJson = window.BuiltinPrinter.printEscPos(base64Data);
    const result: BuiltinPrinterResult = JSON.parse(resultJson);

    if (!result.success) {
      throw new Error(result.error || "Print failed");
    }
  },

  /**
   * Test builtin printer (Android only)
   */
  async testBuiltinPrinter(): Promise<void> {
    if (!window.BuiltinPrinter) {
      throw new Error("Built-in printer not available");
    }

    const detection = this.detectBuiltinPrinter();

    if (!detection?.available) {
      throw new Error("Printer not detected");
    }

    if (detection.type === "usb_builtin") {
      if (!this.hasBuiltinPrinterPermission()) {
        await this.requestBuiltinPrinterPermission();
      }
    }

    const resultJson = window.BuiltinPrinter.printTest();
    const result: BuiltinPrinterResult = JSON.parse(resultJson);

    if (!result.success) {
      throw new Error(result.error || "Test print failed");
    }
  },

  /**
   * Get full diagnostic info for the device (Android only)
   * Use this to identify what print services are available
   */
  getDiagnostics(): PrinterDiagnostics | null {
    if (typeof window !== "undefined" && window.BuiltinPrinter?.getDiagnostics) {
      try {
        const resultJson = window.BuiltinPrinter.getDiagnostics();
        return JSON.parse(resultJson) as PrinterDiagnostics;
      } catch (e) {
        console.error("Failed to get diagnostics:", e);
        return null;
      }
    }
    return null;
  },

  /**
   * Scan for ALL print-related services on the device (Android only)
   * Use this to find vendor-specific print services on unknown devices
   */
  scanPrintServices(): PrintServiceScan | null {
    if (typeof window !== "undefined" && window.BuiltinPrinter?.scanPrintServices) {
      try {
        const resultJson = window.BuiltinPrinter.scanPrintServices();
        return JSON.parse(resultJson) as PrintServiceScan;
      } catch (e) {
        console.error("Failed to scan print services:", e);
        return null;
      }
    }
    return null;
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
    let printedToAny = false;

    // Build ESC/POS commands once in TypeScript
    const escPosCommands = buildReceiptEscPos(receiptData);
    const base64Data = uint8ArrayToBase64(escPosCommands);

    // Print to builtin printer if available and active (from database)
    const builtinPrinter = activePrinters.find((p) => p.printer_type === "builtin");
    if (builtinPrinter) {
      try {
        await this.printReceiptBuiltin(receiptData);
        printedToAny = true;
      } catch (e) {
        errors.push(`Builtin: ${e instanceof Error ? e.message : String(e)}`);
      }
    } else {
      // Try to auto-detect and print to builtin printer even without database entry
      // This handles the case where builtin printer was never registered
      const isBuiltinAvailable = this.isBuiltinPrinterAvailable();
      if (isBuiltinAvailable) {
        try {
          await this.printReceiptBuiltin(receiptData);
          printedToAny = true;
          // Also auto-setup the printer for future use
          this.autoSetupBuiltinPrinter().catch(() => {
            // Ignore auto-setup errors
          });
        } catch (e) {
          errors.push(`Builtin: ${e instanceof Error ? e.message : String(e)}`);
        }
      }
    }

    // Print to network printers via Tauri (raw data, formatted by TS)
    const networkPrinters = activePrinters.filter((p) => p.printer_type === "network");
    if (networkPrinters.length > 0) {
      try {
        await invoke("print_raw_to_all_active", { data: base64Data });
        printedToAny = true;
      } catch (e) {
        errors.push(`Network: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    // If no printers printed successfully and no builtin available, try network fallback
    if (!printedToAny && networkPrinters.length === 0) {
      try {
        await invoke("print_raw_to_all_active", { data: base64Data });
      } catch (e) {
        errors.push(`Fallback: ${e instanceof Error ? e.message : String(e)}`);
      }
    }

    if (errors.length > 0 && !printedToAny) {
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
