import axios from "axios";
import { invoke } from "@tauri-apps/api/core";
import type { GiftCardConfig } from "@/types/giftCard";

const DEFAULT_API_BASE_URL = "https://uatapi.rbsgiftserver.com";

/**
 * Token cache (per config)
 */
let cachedToken: string | null = null;
let tokenExpiry = 0;
let cachedKey = "";

/**
 * Normalize API base URL
 */
function resolveBaseUrl(baseUrl?: string) {
  if (!baseUrl) return DEFAULT_API_BASE_URL;
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}

export const rbsGiftCardService = {
  /**
   * STEP 1: Get access token (TAURI — NO CORS)
   */
  async getToken(config: GiftCardConfig): Promise<string> {
    const key = `${config.clientId}:${config.locationId}`;

    if (
      cachedToken &&
      Date.now() < tokenExpiry &&
      cachedKey === key
    ) {
      return cachedToken;
    }

    const result = await invoke<{
      access_token: string;
      expires_in: number;
    }>("giftcard_get_token", {
      config: {
        client_id: config.clientId,
        location_id: config.locationId, // ✅ REQUIRED
        client_secret: config.clientSecret,
      },
    });

    cachedToken = result.access_token;
    cachedKey = key;
    tokenExpiry =
      Date.now() + (result.expires_in - 60) * 1000;

    return cachedToken;
  },

  /**
   * STEP 2: Send OTP
   */
  sendOtp(
    token: string,
    payload: {
      channel: "EMAIL" | "PHONE";
      email?: string;
      phone?: string;
      applicationName: string;
      terminalId: string;
    },
    baseUrl?: string
  ) {
    const url = resolveBaseUrl(baseUrl);
    return axios.post(
      `${url}/api/partner/v1/otp/send`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * STEP 3: Verify OTP
   */
  verifyOtp(token: string, payload: any, baseUrl?: string) {
    const url = resolveBaseUrl(baseUrl);
    return axios.post(
      `${url}/api/partner/v1/otp/verify`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * STEP 4A: Purchase Gift Card
   */
  purchase(token: string, payload: any, baseUrl?: string) {
    const url = resolveBaseUrl(baseUrl);
    return axios.post(
      `${url}/api/partner/v1/giftcard/purchase`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },

  /**
   * STEP 4B: Redeem Gift Card
   */
  redeem(token: string, payload: any, baseUrl?: string) {
    const url = resolveBaseUrl(baseUrl);
    return axios.post(
      `${url}/api/partner/v1/giftcard/redeem`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  },
};
