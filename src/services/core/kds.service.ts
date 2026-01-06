import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { websocketService } from "@/services/websocket/websocket.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
import type { KdsStatus } from "@/types/kds";

/**
 * KDS Service - Core business logic for KDS operations
 * Implements triple-action pattern: SQLite + WebSocket + API
 */
export const kdsService = {
  /**
   * Update ticket status with triple action:
   * 1. Update local SQLite database
   * 2. Broadcast via WebSocket to POS and Queue devices
   * 3. Sync to API server (if online)
   * 4. Move to READY status (shown in completed page)
   */
  async updateTicketStatus(
    ticketId: string,
    newStatus: KdsStatus,
    additionalData?: {
      ticketNumber?: string;
      orderId?: string;
      tokenNumber?: number;
    }
  ): Promise<void> {
    try {
      console.log(`[KDS Service] Updating ticket ${ticketId} to ${newStatus}`);

      // 1. Update local SQLite database (KDS tickets table)
      await kdsTicketLocal.updateStatus(ticketId, newStatus);

      // 1b. Update main tickets table order_status (for POS/Queue visibility)
      // The orderId in KDS ticket corresponds to the original ticket ID
      if (additionalData?.orderId) {
        try {
          await ticketLocal.updateOrderStatus(additionalData.orderId, newStatus);
          console.log(`[KDS Service] Updated main ticket ${additionalData.orderId} order_status to ${newStatus}`);
        } catch (error) {
          console.error("[KDS Service] Failed to update main ticket order_status:", error);
        }
      }

      // 2. Broadcast via WebSocket to POS and Queue devices
      if (newStatus === "READY") {
        // Broadcast to POS that order is ready
        try {
          await websocketService.broadcastToPOS({
            message_type: "order_ready",
            device_type: "KDS",
            device_id: undefined,
            payload: {
              ticket_id: ticketId,
              ticket_number: additionalData?.ticketNumber,
              order_id: additionalData?.orderId,
              token_number: additionalData?.tokenNumber,
              status: "READY",
              timestamp: new Date().toISOString(),
            },
          });
          console.log(`[KDS Service] Broadcasted order ready to POS`);
        } catch (error) {
          console.error("[KDS Service] Failed to broadcast to POS:", error);
        }

        // Broadcast to Queue display
        try {
          await websocketService.broadcastToQueue({
            message_type: "order_ready",
            device_type: "KDS",
            device_id: undefined,
            payload: {
              ticket_id: ticketId,
              ticket_number: additionalData?.ticketNumber,
              token_number: additionalData?.tokenNumber,
              status: "READY",
              timestamp: new Date().toISOString(),
            },
          });
          console.log(`[KDS Service] Broadcasted order ready to Queue`);
        } catch (error) {
          console.error("[KDS Service] Failed to broadcast to Queue:", error);
        }
      }

      // 3. Sync to API server (if online)
      // TODO: Implement API sync when backend endpoint is ready
      // if (await isOnline()) {
      //   await apiService.updateKdsTicketStatus(ticketId, newStatus);
      // }

      // Emit status change event for local UI updates
      localEventBus.emit(LocalEventTypes.KDS_STATUS_CHANGED, {
        ticketId,
        newStatus,
        timestamp: new Date().toISOString(),
      });

      // Emit ticket removal event if READY (to remove from active tickets view)
      if (newStatus === "READY") {
        localEventBus.emit(LocalEventTypes.KDS_TICKET_REMOVED, { ticketId });
      }

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
    ticketNumber?: string,
    orderId?: string,
    tokenNumber?: number
  ): Promise<void> {
    await this.updateTicketStatus(ticketId, "READY", { ticketNumber, orderId, tokenNumber });
  },

  /**
   * Start preparing a ticket (change from PENDING to IN_PROGRESS)
   */
  async startPreparingTicket(ticketId: string): Promise<void> {
    await this.updateTicketStatus(ticketId, "IN_PROGRESS");
  },
};
