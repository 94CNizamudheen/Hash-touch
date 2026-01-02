import type { TicketRequest } from "@/types/ticket";
import { ticketLocal } from "../local/ticket.local.service";
import { isOnline } from "@/ui/utils/networkDetection";
import { API_BASE } from "@/config/env";

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
  console.log("response of ticket fetch",res)

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(
      `Failed to ${path}: ${res.status} ${res.statusText} - ${errorText}`
    );
  }

  const data = await res.json();

  return data;
}

export const ticketService = {
  /**
   * Create or sync a ticket
   * If online: sends directly to API
   * If offline: saves to local database for later sync
   */
  async createTicket(
    domain: string,
    token: string,
    ticketRequest: TicketRequest
  ): Promise<{ success: boolean; ticketId?: string; offline?: boolean }> {
    const online = await isOnline();

    // Prepare metadata for saving
    const metadata = {
      locationId: ticketRequest.ticket.location_id,
      orderModeName: ticketRequest.ticket.ordermode_name,
      ticketAmount: Math.round(ticketRequest.ticket.ticket_amount * 100), // Store in cents
      itemsCount: ticketRequest.orders.length,
      queueNumber: ticketRequest.ticket.queue_number,
      ticketNumber: ticketRequest.ticket.ticket_number,
    };

    if (online) {
      try {
        await post(domain, "sync-tickets", token, [ticketRequest]);

        // Save to local DB with SYNCED status for online tickets
        const ticketId = await ticketLocal.save(ticketRequest, {
          ...metadata,
          syncStatus: "SYNCED",
        });

        return { success: true, ticketId, offline: false };
      } catch (error) {
        // If API call fails, save offline with PENDING status
        const ticketId = await ticketLocal.save(ticketRequest, {
          ...metadata,
          syncStatus: "PENDING",
        });
        return { success: true, ticketId, offline: true };
      }
    } else {
      // Save offline with PENDING status
      const ticketId = await ticketLocal.save(ticketRequest, {
        ...metadata,
        syncStatus: "PENDING",
      });
      return { success: true, ticketId, offline: true };
    }
  },

  /**
   * Sync pending tickets to API
   * Returns array of successfully synced ticket IDs
   */
  async syncPendingTickets(
    domain: string,
    token: string
  ): Promise<{ synced: string[]; failed: string[] }> {
    const online = await isOnline();

    if (!online) {
      throw new Error("Cannot sync tickets while offline");
    }

    const pendingTickets = await ticketLocal.getPending();

    if (pendingTickets.length === 0) {
      return { synced: [], failed: [] };
    }

    const synced: string[] = [];
    const failed: string[] = [];

    for (const dbTicket of pendingTickets) {
      try {
        console.log(`🔄 Processing ticket ${dbTicket.id}`);

        // Update status to SYNCING
        await ticketLocal.updateSyncStatus(dbTicket.id, "SYNCING");

        // Parse and send ticket
        const ticketRequest: TicketRequest = JSON.parse(dbTicket.ticket_data);
        console.log(`📡 Sending ticket to API:`, {
          ticketNumber: ticketRequest.ticket.ticket_number,
          amount: ticketRequest.ticket.ticket_amount,
          orderCount: ticketRequest.orders.length,
        });

        await post(domain, "sync-tickets", token, [ticketRequest]);

        // Update status to SYNCED
        await ticketLocal.updateSyncStatus(dbTicket.id, "SYNCED");
        synced.push(dbTicket.id);
        console.log(` Successfully synced ticket: ${dbTicket.id}`);
      } catch (error) {
        // Update status to FAILED
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        await ticketLocal.updateSyncStatus(dbTicket.id, "FAILED", errorMessage);
        failed.push(dbTicket.id);
        console.error(`Failed to sync ticket ${dbTicket.id}:`, error);
        console.error(`📝 Error details:`, {
          message: errorMessage,
          type: error?.constructor?.name,
        });
      }
    }

    console.log(`Sync complete: ${synced.length} synced, ${failed.length} failed`);
    return { synced, failed };
  },

  /**
   * Legacy method for backward compatibility
   */
  syncTickets(domain: string, token: string, tickets: TicketRequest[]) {
    console.log("📡 Syncing tickets:", tickets.length);
    return post(domain, "sync-tickets", token, tickets);
  },
};
