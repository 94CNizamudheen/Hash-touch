import { API_BASE } from "@/config/env";
import type { DeviceRole } from "@/types/app-state";

export interface GetProductsPayload {
  channel: string;
  location_id: string;
  brand_id: string;
  order_mode_id: string[]; // Note: Backend expects 'order_mode_id' (singular) not 'order_mode_ids'
}
export interface GetOrderModesPayload {
  channel: string;
  location_id: string;
  brand_id: string
}




async function post(domain: string, path: string, token: string, body?: Record<string, any>) {
  const url = `${API_BASE}/api/${domain}/outbound/${path}`;
  const requestBody = body ? JSON.stringify(body) : undefined;

  console.log(`📡 POST ${url}`);
  console.log(`📡 Request body:`, requestBody);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      'Content-type': 'application/json'
    },
    body: requestBody,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status} ${res.statusText}`);
  }

  const data = await res.json();

  // Don't log full response for large datasets, just metadata
  if (path === 'product-combinations') {
    console.log(`📡 Response from ${path}: ${data?.length || 0} groups`);
  } else {
    console.log(`📡 Response from ${path}:`, data);
  }

  return data;
}

async function get(domain: string, path: string, token: string, query?: string) {
  const url = `${API_BASE}/api/${domain}/${path}${query ? `?${query}` : ""}`;

  const res = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return res.json();
}







export const commonDataService = {

  getSetup(domain: string, token: string) {
    return post(domain, "setup", token);
  },
  getProducts(domain: string, token: string, payload: GetProductsPayload) {
    return post(domain, "products", token, payload);
  },
  getCategories(domain: string, token: string, payload?: GetProductsPayload) {
    return post(domain, "product-categories", token, payload);
  },
  getProductGroups(domain: string, token: string, payload: GetProductsPayload) {
    return post(domain, "product-groups", token, payload);
  },
  getCombinations(domain: string, token: string, payload: GetProductsPayload) {
    return post(domain, "product-combinations", token, payload);
  },
  getOrderModes(domain: string, token: string, payload: GetOrderModesPayload) {
    return post(domain, "order-modes", token, payload);
  },
  getCharges(domain: string, token: string, payload: GetProductsPayload) {
    return post(domain, "charges", token, payload);
  },
  getPaymentTypes(domain: string, token: string, payload: GetProductsPayload) {
    return post(domain, "payment-types", token, payload);
  },
  getTransactionTypes(domain: string, token: string) {
    return post(domain, "transaction-types", token);
  },
  getLocations(domain: string, token: string) {
    return post(domain, "locations", token);
  },

  getSetups(
    domain: string,
    token: string,
    code: string,
    channel: DeviceRole
  ) {
    if (!domain) {
      throw new Error("Tenant domain is missing");
    }

    const params = new URLSearchParams({
      include_schedules: "true",
      channels: channel,
      filter: `code||$eq||${code}`,
    });

    return get(
      domain,
      "connect/manage/setups",
      token,
      params.toString()
    );
  },

};




