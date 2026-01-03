import type { WorkdayPayload, WorkdayResponse, WorkdayUpdateResponse } from "@/types/workday";
import { API_BASE } from "@/config/env";
import { isOnline } from "@/ui/utils/networkDetection";

async function post(domain: string, path: string, token: string, body: any) {
  const url = `${API_BASE}/api/${domain}/inbound/${path}`;

  console.log(`📡 POST ${url}`);
  console.log(`📡 Request body:`, JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("response of workday fetch", res);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to ${path}: ${res.status} ${res.statusText} - ${errorText}`
    );
  }

  const data = await res.json();
  return data;
}

async function patch(
  domain: string,
  path: string,
  token: string,
  body: any
) {
  const url = `${API_BASE}/api/${domain}/inbound/${path}`;

  console.log(`📡 PATCH ${url}`);
  console.log(`📡 Request body:`, JSON.stringify(body, null, 2));

  const res = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "*/*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  console.log("response of workday update", res);

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to ${path}: ${res.status} ${res.statusText} - ${errorText}`
    );
  }

  const data = await res.json();
  return data;
}

export const workdayDataService = {

  async syncWorkday(
    domain: string,
    token: string,
    workdayData: WorkdayPayload
  ): Promise<WorkdayResponse> {
    const online = await isOnline();

    if (!online) {
      throw new Error("Cannot sync workday while offline");
    }

    return post(domain, "sync-workdays", token, workdayData);
  },

  /**
   * Update an existing workday
   * PATCH /api/{domain}/inbound/update-workday/{wid}
   */
  async updateWorkday(
    domain: string,
    token: string,
    workdayId: string,
    workdayData: Partial<WorkdayPayload>
  ): Promise<WorkdayUpdateResponse> {
    const online = await isOnline();

    if (!online) {
      throw new Error("Cannot update workday while offline");
    }

    return patch(domain, `update-workday/${workdayId}`, token, workdayData);
  },

  /**
   * Start a new workday
   * Creates initial workday record with start information
   */
  async startWorkday(
    domain: string,
    token: string,
    locationId: string,
    startUser: string
  ): Promise<WorkdayResponse> {
    const workdayData: WorkdayPayload = {
      location_id: locationId,
      start_user: startUser,
      start_time: new Date().toISOString(),
      work_period_day: new Date().toISOString().split("T")[0],
      business_date: new Date().toISOString().split("T")[0],
      total_sales: 0,
      total_taxes: 0,
      total_ticket_count: 0,
      auto_closed: false,
      external_processed: false,
    };

    return this.syncWorkday(domain, token, workdayData);
  },

  /**
   * End an existing workday
   * Updates workday with end information and final totals
   */
  async endWorkday(
    domain: string,
    token: string,
    workdayId: string,
    locationId: string,
    endUser: string,
    totals?: {
      totalSales?: number;
      totalTaxes?: number;
      totalTicketCount?: number;
    }
  ): Promise<WorkdayUpdateResponse> {
    const updateData: Partial<WorkdayPayload> = {
      location_id: locationId, // API requires location_id even for updates
      end_user: endUser,
      end_time: new Date().toISOString(),
      auto_closed: false,
      ...(totals && {
        total_sales: totals.totalSales,
        total_taxes: totals.totalTaxes,
        total_ticket_count: totals.totalTicketCount,
      }),
    };

    return this.updateWorkday(domain, token, workdayId, updateData);
  },
};
