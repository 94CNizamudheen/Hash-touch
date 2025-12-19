const API_BASE = "https://development.hc.hashtape.com";

export interface GetProductsPayload {
  channel: string;
  location_id: string;
  brand_id: string;
  order_mode_ids: string[];
}
export interface GetOrderModesPayload{
  channel:string;
  location_id:string;
  brand_id:string
}




async function post(domain: string, path: string, token: string,body?:Record<string,any>) {
  const res = await fetch(`${API_BASE}/api/${domain}/outbound/${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      'Content-type':'application/json'
    },
    body: body? JSON.stringify(body):undefined,
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
  getCharges(domain: string, token: string) {
    return post(domain, "charges", token);
  },
  getPaymentTypes(domain: string, token: string) {
    return post(domain, "payment-types", token);
  },
  getTransactionTypes(domain: string, token: string) {
    return post(domain, "transaction-types", token);
  },
};
