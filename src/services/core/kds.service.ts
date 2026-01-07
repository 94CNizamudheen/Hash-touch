import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
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
