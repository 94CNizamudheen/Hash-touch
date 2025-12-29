import { API_BASE } from "@/config/env";

export interface GetProductsPayload {
  channel: string;
  location_id: string;
  brand_id: string;
  order_mode_id: string[]; // Note: Backend expects 'order_mode_id' (singular) not 'order_mode_ids'
}
export interface GetOrderModesPayload{
  channel:string;
  location_id:string;
  brand_id:string
}




async function post(domain: string, path: string, token: string,body?:Record<string,any>) {
  const url = `${API_BASE}/api/${domain}/outbound/${path}`;
  const requestBody = body ? JSON.stringify(body) : undefined;

  console.log(`📡 POST ${url}`);
  console.log(`📡 Request body:`, requestBody);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      'Content-type':'application/json'
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

export const commonDataService = {
  
  getSetup(domain: string, token: string) {
    return post(domain, "setup", token);
  },
  getProducts(domain: string, token: string,payload:GetProductsPayload) {
    return post(domain, "products", token,payload);
  },
  getCategories(domain: string, token: string,payload?:GetProductsPayload) {
    return post(domain, "product-categories", token,payload);
  },
  getProductGroups(domain: string, token: string,payload:GetProductsPayload) {
    return post(domain, "product-groups", token,payload);
  },
  getCombinations(domain: string, token: string,payload:GetProductsPayload) {
    return post(domain, "product-combinations", token,payload);
  },
  getOrderModes(domain: string, token: string,payload:GetOrderModesPayload) {
    return post(domain, "order-modes", token,payload);
  },
  getCharges(domain: string, token: string, payload:GetProductsPayload) {
    return post(domain, "charges", token,payload);
  },
  getPaymentTypes(domain: string, token: string) {
    return post(domain, "payment-types", token);
  },
  getTransactionTypes(domain: string, token: string) {
    return post(domain, "transaction-types", token);
  },
  getLocations(domain:string,token:string){
    return post(domain, "locations",token);
  }
};

