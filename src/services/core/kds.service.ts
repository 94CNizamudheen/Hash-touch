import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { websocketService } from "@/services/websocket/websocket.service";
import { localEventBus } from "@/services/eventbus/LocalEventBus";
import type { KdsStatus } from "@/types/kds";

/**
 * KDS Service - Core business logic for KDS operations
 * Implements triple-action pattern: SQLite + WebSocket + API
 */
export const kdsService = {
  /**
   * Update ticket status with triple action:
   * 1. Update local SQLite database
   * 2. Broadcast via WebSocket to other devices
   * 3. Sync to API server (if online)
   * 4. Auto-remove if status is READY
   */
  async updateTicketStatus(
    ticketId: string,
    newStatus: KdsStatus,
    additionalData?: {
      orderId?: string;
      tokenNumber?: number;
    }
  ): Promise<void> {
    try {
      console.log(`[KDS Service] Updating ticket ${ticketId} to ${newStatus}`);

      // 1. Update local SQLite database
      await kdsTicketLocal.updateStatus(ticketId, newStatus);

      // 2. Broadcast via WebSocket to other devices
      if (newStatus === "READY" && additionalData?.orderId && additionalData?.tokenNumber) {
        // Send order ready message
        websocketService.send("order:ready", {
          order_id: additionalData.orderId,
          token: additionalData.tokenNumber,
          message: `Order #${additionalData.orderId} is ready — Token ${additionalData.tokenNumber}`,
          sender: "kds",
        });

        // Update queue status
        websocketService.send("queue:update", {
          token_number: additionalData.tokenNumber,
          status: "READY",
        });
      }

      // Broadcast status change to all devices
      websocketService.send("kds_status_update", {
        ticket_id: ticketId,
        status: newStatus,
        timestamp: new Date().toISOString(),
      });

      // 3. Sync to API server (if online)
      // TODO: Implement API sync when backend endpoint is ready
      // if (await isOnline()) {
      //   await apiService.updateKdsTicketStatus(ticketId, newStatus);
      // }

      // 4. Auto-remove if READY status
      if (newStatus === "READY") {
        console.log(`[KDS Service] Scheduling auto-removal for ticket ${ticketId}`);

        // Wait 500ms before removing
        setTimeout(async () => {
          try {
            await kdsTicketLocal.deleteTicket(ticketId);
            console.log(`[KDS Service] Auto-removed ticket ${ticketId}`);

            // Emit local event to refresh UI
            localEventBus.emit("kds:ticket_removed", { ticketId });
          } catch (error) {
            console.error(`[KDS Service] Failed to auto-remove ticket ${ticketId}:`, error);
          }
        }, 500);
      }

      // Emit status change event
      localEventBus.emit("kds:status_changed", {
        ticketId,
        newStatus,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      console.error("[KDS Service] Failed to update ticket status:", error);
      throw error;
    }
  },

  /**
   * Mark all items in a ticket as completed and set ticket to READY
   */
  async markTicketReady(
    ticketId: string,
    orderId?: string,
    tokenNumber?: number
  ): Promise<void> {
    await this.updateTicketStatus(ticketId, "READY", { orderId, tokenNumber });
  },

  /**
   * Start preparing a ticket (change from PENDING to IN_PROGRESS)
   */
  async startPreparingTicket(ticketId: string): Promise<void> {
    await this.updateTicketStatus(ticketId, "IN_PROGRESS");
  },
};
