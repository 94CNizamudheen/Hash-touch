import { invoke } from "@tauri-apps/api/core";
import type { TicketRequest } from "@/types/ticket";

export interface DbTicket {
  id: string;
  ticket_data: string; // JSON stringified TicketRequest
  sync_status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  sync_error?: string | null;
  sync_attempts: number;
  location_id?: string | null;
  order_mode_name?: string | null;
  ticket_amount?: number | null;
  items_count?: number | null;
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
  }): Promise<string> {
    const now = new Date().toISOString();
    const ticketId = `ticket-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const dbTicket: DbTicket = {
      id: ticketId,
      ticket_data: JSON.stringify(ticketRequest),
      sync_status: "PENDING",
      sync_error: null,
      sync_attempts: 0,
      location_id: metadata?.locationId || null,
      order_mode_name: metadata?.orderModeName || null,
      ticket_amount: metadata?.ticketAmount || null,
      items_count: metadata?.itemsCount || null,
      created_at: now,
      updated_at: now,
      synced_at: null,
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
      ticketId,
      status,
      error: error || null,
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
};
