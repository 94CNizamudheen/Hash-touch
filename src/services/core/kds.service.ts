import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { queueTokenLocal } from "@/services/local/queue-token.local.service";
import { websocketService } from "@/services/websocket/websocket.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
import type { KdsStatus } from "@/types/kds";

export const kdsService = {
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
      console.log(`[KDS] Updating ticket ${ticketId} → ${newStatus}`);
      await kdsTicketLocal.updateStatus(ticketId, newStatus);
      
      if (newStatus === "READY") {
        /* Update local queue token status (for single device switching) */
        if (additionalData?.tokenNumber) {
          try {
            await queueTokenLocal.updateStatus(additionalData.tokenNumber, "CALLED");
            console.log("[KDS] ✅ Queue token updated to READY locally");
          } catch (err) {
            console.error("[KDS] Failed to update queue token status:", err);
          }
        }

        /* Broadcast via WebSocket (for multi-device) */
        const client = websocketService.getClient();

        if (!client || !client.isConnected()) {
          console.warn("[KDS] WebSocket not connected, order_ready skipped");
        } else {
          client.send({
            message_type: "order_ready",
            device_type: "KDS",
            payload: {
              ticket_id: ticketId,
              ticket_number: additionalData?.ticketNumber,
              order_id: additionalData?.orderId,
              token_number: additionalData?.tokenNumber,
              status: "READY",
              timestamp: new Date().toISOString(),
            },
          });

          console.log("[KDS] 📤 order_ready sent via WebSocket");
        }

        /* Emit local event for Queue display refresh */
        localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
          tokenNumber: additionalData?.tokenNumber,
          status: "READY",
        });
      }

      /* 3️⃣ Local UI events (KDS only) */
      localEventBus.emit(LocalEventTypes.KDS_STATUS_CHANGED, {
        ticketId,
        newStatus,
        timestamp: new Date().toISOString(),
      });

      if (newStatus === "READY") {
        localEventBus.emit(LocalEventTypes.KDS_TICKET_REMOVED, { ticketId });
      }
    } catch (error) {
      console.error("[KDS] Failed to update ticket:", error);
      throw error;
    }
  },

  async markTicketReady(
    ticketId: string,
    ticketNumber?: string,
    orderId?: string,
    tokenNumber?: number
  ): Promise<void> {
    await this.updateTicketStatus(ticketId, "READY", {
      ticketNumber,
      orderId,
      tokenNumber,
    });
  },

  async startPreparingTicket(ticketId: string): Promise<void> {
    await this.updateTicketStatus(ticketId, "IN_PROGRESS");
  },
};
