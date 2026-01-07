

import type { } from "@/types/common";
import { queueTokenLocal } from "@/services/local/queue-token.local.service";
import {
  localEventBus,
  LocalEventTypes,
} from "@/services/eventbus/LocalEventBus";
import type { QueueStatus, QueueTokenData } from "@/types/queue";

export const queueService = {

  async getActiveTokens(): Promise<QueueTokenData[]> {
    const tokens = await queueTokenLocal.getActiveTokens();

    // Map DB shape → UI shape (if needed)
    return tokens.map((t) => ({
      id: t.id,
      ticket_id: t.ticket_id,
      ticket_number: t.ticket_number,
      token_number: t.token_number,
      status: t.status as QueueStatus,
      source: t.source,
      location_id: t.location_id,
      order_mode: t.order_mode,
      created_at: t.created_at,
      called_at: t.called_at,
      served_at: t.served_at,
    }));
  },


  async updateTokenStatusByNumber(
    tokenNumber: number,
    status: QueueStatus
  ): Promise<void> {
    console.log(
      `[Queue Service] Updating token ${tokenNumber} → ${status}`
    );

    await queueTokenLocal.updateStatus(tokenNumber, status);

    if (status === "CALLED") {
      localEventBus.emit(LocalEventTypes.QUEUE_TOKEN_CALLED, {
        tokenNumber,
      });
    }

    if (status === "SERVED") {
      localEventBus.emit(LocalEventTypes.QUEUE_TOKEN_SERVED, {
        tokenNumber,
      });
    }

    localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
      tokenNumber,
      status,
    });
  },
};
