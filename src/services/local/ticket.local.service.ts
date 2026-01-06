import { invoke } from "@tauri-apps/api/core";
import type { TicketRequest } from "@/types/ticket";

export interface DbTicket {
  id: string;
  ticket_data: string; // JSON stringified TicketRequest
  sync_status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  sync_error?: string | null;
  sync_attempts: number;
  order_status?: "IN_PROGRESS" | "READY" | "COMPLETED" | null;
  location_id?: string | null;
  order_mode_name?: string | null;
  ticket_amount?: number | null;
  items_count?: number | null;
  queue_number?: number | null;
  ticket_number?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
  synced_at?: string | null;
}

export interface SyncStats {
  pending: number;
  failed: number;
  synced: number;
}

export const ticketLocal = {
  async save(ticketRequest: TicketRequest, metadata?: {
    locationId?: string;
    orderModeName?: string;
    ticketAmount?: number;
    itemsCount?: number;
    queueNumber?: number;
    ticketNumber?: number;
    syncStatus?: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
    orderStatus?:  "IN_PROGRESS" | "READY" | "COMPLETED";
  }): Promise<string> {
    const now = new Date().toISOString();
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const dbTicket: DbTicket = {
      id: ticketId,
      ticket_data: JSON.stringify(ticketRequest),
      sync_status: metadata?.syncStatus || "PENDING",
      sync_error: null,
      sync_attempts: 0,
      order_status: metadata?.orderStatus || "IN_PROGRESS",
      location_id: metadata?.locationId || null,
      order_mode_name: metadata?.orderModeName || null,
      ticket_amount: metadata?.ticketAmount || null,
      items_count: metadata?.itemsCount || null,
      queue_number: metadata?.queueNumber || null,
      ticket_number: metadata?.ticketNumber || null,
      created_at: now,
      updated_at: now,
      synced_at: metadata?.syncStatus === "SYNCED" ? now : null,
    };

    await invoke("save_ticket", { ticket: dbTicket });
    return ticketId;
  },

  getAll(): Promise<DbTicket[]> {
    return invoke("get_all_tickets");
  },

  getPending(): Promise<DbTicket[]> {
    return invoke("get_pending_tickets");
  },

  updateSyncStatus(
    ticketId: string,
    status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED",
    error?: string
  ): Promise<void> {
    return invoke("update_ticket_sync_status", {
      ticket_id:ticketId,
      status,
      error: error || null,
    });
  },

  updateOrderStatus(
    ticketId: string,
    orderStatus: "IN_PROGRESS" | "READY" | "COMPLETED"
  ): Promise<void> {
    return invoke("update_ticket_order_status", {
      ticket_id:ticketId,
      order_status:orderStatus,
    });
  },

  delete(ticketId: string): Promise<void> {
    return invoke("delete_ticket", { ticketId });
  },

  async getSyncStats(): Promise<SyncStats> {
    const stats: [number, number, number] = await invoke("get_sync_stats");
    return {
      pending: stats[0],
      failed: stats[1],
      synced: stats[2],
    };
  },

  clearAll(): Promise<void> {
    return invoke("clear_all_tickets");
  },

  /**
   * Get the next queue number for a location and business date
   * Queue numbers reset daily per location
   */
  async getNextQueueNumber(locationId: string, businessDate: string): Promise<number> {
    const maxQueueNumber: number | null = await invoke("get_max_queue_number", {
      locationId,
      businessDate,
    });

    // If no tickets exist for today at this location, start at 1
    return (maxQueueNumber ?? 0) + 1;
  },
};
