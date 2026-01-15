
import { invoke } from "@tauri-apps/api/core";
import type { GiftCardConfig } from "@/types/giftCard"; 

interface GiftCardTokenResult {
  access_token: string;
  expires_in: number;
}

export async function getGiftCardToken(
  config: GiftCardConfig
): Promise<GiftCardTokenResult> {
  return invoke("giftcard_get_token", { config });
}
