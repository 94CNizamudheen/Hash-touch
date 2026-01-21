import { invoke } from "@tauri-apps/api/core";
import type { DbPaymentMethod } from "@/types/payment_methods";
import type { TerminalTransactionStatus } from "./terminal.local.service";
import type { PaymentEntry } from "@/ui/components/pos/checkout/OrderSidebar";
import { generateUUID } from "@/utils/uuid";

export function isTerminalApproved(status: TerminalTransactionStatus) {
  const code = status.processor_response_code?.toUpperCase();
  const resp = status.response?.toUpperCase();
  const state = status.status?.toUpperCase();

  return (
    code === "APPR" ||
    resp === "APPROVAL" ||
    state === "PENDINGSETTLEMENT"
  );
}

export function isTerminalFinal(status: TerminalTransactionStatus) {
  const state = status.status?.toUpperCase();

  return (
    state === "PENDINGSETTLEMENT" ||
    state === "DECLINED" ||
    state === "FAILED" ||
    state === "REJECTED"
  );
}

export function buildUpdatedPayments(
  payments: PaymentEntry[],
  method: any,
  amount: number
): PaymentEntry[] {
  const existingIndex = payments.findIndex(
    (p) => p.paymentMethodId === method.id
  );

  if (existingIndex >= 0) {
    return payments.map((p, idx) =>
      idx === existingIndex
        ? {
            ...p,
            amount: p.amount + amount,
            timestamp: new Date().toISOString(),
          }
        : p
    );
  }

  return [
    ...payments,
    {
      id: generateUUID(),
      paymentMethodId: method.id,
      paymentMethodName: method.name,
      amount,
      timestamp: new Date().toISOString(),
    },
  ];
}

// Types for processor configuration
interface ProcessorDataItem {
  key: string;
  type: string;
  options: {
    type: string;
    label: string;
    placeholder: string;
    options?: { label: string; value: string }[];
  };
  defaultValue?: string;
}

export interface ProcessorConfig {
  id: number;
  name: string;
  data: ProcessorDataItem[];
}

// Parse processor JSON string to array of ProcessorConfig
export function parseProcessor(processor?: string): ProcessorConfig[] {
  if (!processor) return [];
  try {
    return JSON.parse(processor) as ProcessorConfig[];
  } catch {
    console.error("Failed to parse processor JSON");
    return [];
  }
}

// Get surcharge configuration from processor
function getSurchargeConfig(processor?: string): {
  type: "percentage" | "fixed";
  calculationType: "increase" | "decrease";
  value: number;
} | null {
  const processors = parseProcessor(processor);
  const surchargeProcessor = processors.find((p) => p.name === "Payment Surcharge");

  if (!surchargeProcessor) return null;

  const typeItem = surchargeProcessor.data.find((d) => d.key === "type");
  const calculationTypeItem = surchargeProcessor.data.find((d) => d.key === "calculation_type");
  const valueItem = surchargeProcessor.data.find((d) => d.key === "value");

  const type = (typeItem?.defaultValue as "percentage" | "fixed") || "percentage";
  const calculationType = (calculationTypeItem?.defaultValue as "increase" | "decrease") || "increase";
  const value = parseFloat(valueItem?.defaultValue || "0");

  return { type, calculationType, value };
}

// Calculate surcharge amount based on configuration
export function calculateSurcharge(
  amount: number,
  processor?: string
): { surchargeAmount: number; adjustedTotal: number; hasSurcharge: boolean } {
  const config = getSurchargeConfig(processor);

  if (!config || config.value === 0) {
    return { surchargeAmount: 0, adjustedTotal: amount, hasSurcharge: false };
  }

  let surchargeAmount: number;

  if (config.type === "percentage") {
    surchargeAmount = Math.round((amount * config.value / 100) * 100) / 100;
  } else {
    // Fixed amount
    surchargeAmount = config.value;
  }

  let adjustedTotal: number;
  if (config.calculationType === "increase") {
    adjustedTotal = Math.round((amount + surchargeAmount) * 100) / 100;
  } else {
    // Decrease
    adjustedTotal = Math.round((amount - surchargeAmount) * 100) / 100;
    surchargeAmount = -surchargeAmount; // Make negative for display
  }
  console.log("Surcharge calculated:", { surchargeAmount, adjustedTotal ,hasSurcharge: true});

  return { surchargeAmount, adjustedTotal, hasSurcharge: true };
}

export const paymentMethodLocal = {
  savePaymentMethods(items: DbPaymentMethod[]) {
    console.log("📤 paymentMethodLocal.savePaymentMethods called with", items.length, "items");
    return invoke("save_payment_methods", { items });
  },

  getAllPaymentMethods(): Promise<DbPaymentMethod[]> {
    return invoke("get_payment_methods");
  },

  clearCache(): Promise<void> {
    return invoke("clear_payment_methods_cache");
  },
};

