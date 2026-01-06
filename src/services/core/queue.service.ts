

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
      ticketId: t.ticketId,
      ticketNumber: t.ticketNumber,
      tokenNumber: t.tokenNumber,
      status: t.status as QueueStatus,
      source: t.source,
      locationId: t.locationId,
      orderMode: t.orderMode,
      createdAt: t.createdAt,
      calledAt: t.calledAt,
      servedAt: t.servedAt,
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
