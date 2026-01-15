import type { ProcessorConfig } from "@/services/local/payment-method.local.service";

export interface GiftCardConfig {
  clientId: string;
  clientSecret: string;
  applicationName: string;
  terminalId: string;
  baseUrl: string;
}

export function getGiftCardConfig(processor?: string): GiftCardConfig | null {
  if (!processor) return null;

  let processors: ProcessorConfig[];

  try {
    processors = JSON.parse(processor);
  } catch {
    console.error("GiftCard: Failed to parse processor JSON");
    return null;
  }

  const giftCardProcessor = processors.find(
    (p) => p.name === "RBS Gift Card"
  );

  if (!giftCardProcessor) return null;

  const map: Record<string, string> = {};

  for (const d of giftCardProcessor.data) {
    if (d?.key && d?.defaultValue) {
      map[d.key] = d.defaultValue;
    }
  }

  // REQUIRED validation
  if (
    !map.client_id ||
    !map.client_secret ||
    !map.application_name ||
    !map.terminal_id
  ) {
    console.error("GiftCard: Missing required config", map);
    return null;
  }

  return {
    clientId: map.client_id,
    clientSecret: map.client_secret,
    applicationName: map.application_name,
    terminalId: map.terminal_id,
    baseUrl: map.base_url ?? "https://uatapi.rbsgiftserver.com",
  };
}
