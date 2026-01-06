import { invoke } from "@tauri-apps/api/core";
import type { KDSTicketData, KdsStatus } from "@/types/kds";

export const kdsTicketLocal = {
  /**
   * Save KDS ticket to local database
   */
  async saveTicket(ticket: KDSTicketData): Promise<string> {
    try {
      const ticketForRust = {
        id: ticket.id,
        ticket_number: ticket.ticketNumber,
        order_id: ticket.orderId,
        location_id: ticket.locationId,
        order_mode_name: ticket.orderModeName,
        status:ticket.status,
        items: ticket.items,
        total_amount: ticket.totalAmount,
        token_number: ticket.tokenNumber,
        created_at: ticket.createdAt,
        updated_at: ticket.updatedAt,
      };

      await invoke("save_kds_ticket", { ticket: ticketForRust });
      return ticket.id;
    } catch (error) {
      console.error("Failed to save KDS ticket:", error);
      throw error;
    }
  },

  /**
   * Get all KDS tickets (including READY status)
   */
  async getAllTickets(): Promise<KDSTicketData[]> {
    try {
      const tickets = await invoke<any[]>("get_all_kds_tickets");

      return tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        orderId: t.order_id,
        locationId: t.location_id,
        orderModeName: t.order_mode_name,
        status:t.status,
        items: t.items,
        totalAmount: t.total_amount,
        tokenNumber: t.token_number,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
        
      }));
    } catch (error) {
      console.error("Failed to get all KDS tickets:", error);
      return [];
    }
  },

  /**
   * Get active KDS tickets (excludes READY status)
   * This is used for the main KDS display
   */
  async getActiveTickets(): Promise<KDSTicketData[]> {
    try {
      const tickets = await invoke<any[]>("get_active_kds_tickets");

      return tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        orderId: t.order_id,
        locationId: t.location_id,
        orderModeName: t.order_mode_name,
        status:t.status,
        items: t.items,
        totalAmount: t.total_amount,
        tokenNumber: t.token_number,
        createdAt: t.created_at,
        updatedAt: t.updated_at,

      }));
    } catch (error) {
      console.error("Failed to get active KDS tickets:", error);
      return [];
    }
  },

  /**
   * Get KDS tickets by status
   */
  async getTicketsByStatus(status: KdsStatus): Promise<KDSTicketData[]> {
    try {
      const tickets = await invoke<any[]>("get_kds_tickets_by_status", { status });

      return tickets.map(t => ({
        id: t.id,
        ticketNumber: t.ticket_number,
        orderId: t.order_id,
        locationId: t.location_id,
        orderModeName: t.order_mode_name,
        status:t.status,
        items: t.items,
        totalAmount: t.total_amount,
        tokenNumber: t.token_number,
        createdAt: t.created_at,
        updatedAt: t.updated_at,
      }));
    } catch (error) {
      console.error(`Failed to get KDS tickets with status ${status}:`, error);
      return [];
    }
  },

  /**
   * Update KDS ticket status
   */
  async updateStatus(ticketId: string, status: KdsStatus): Promise<void> {
    try {
      await invoke("update_kds_ticket_status", { ticketId, status });
    } catch (error) {
      console.error("Failed to update KDS ticket status:", error);
      throw error;
    }
  },

  /**
   * Delete KDS ticket (used for auto-removal after READY)
   */
  async deleteTicket(ticketId: string): Promise<void> {
    try {
      await invoke("delete_kds_ticket", { ticketId });
    } catch (error) {
      console.error("Failed to delete KDS ticket:", error);
      throw error;
    }
  },
};
