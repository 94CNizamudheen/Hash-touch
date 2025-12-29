import { API_BASE } from "@/config/env";

export const locationService = {
  async fetchLocations(domain: string, token: string) {
    const res = await fetch(
      `${API_BASE}/api/${domain}/outbound/locations`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        },
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch locations");
    }

    return res.json();
  },
};

