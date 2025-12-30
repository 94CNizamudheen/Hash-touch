/**
 * Queue Service - Stub implementation
 * TODO: Implement full queue service with queue display integration
 */

export type QueueStatus = "WAITING" | "CALLED" | "SERVED";

export interface QueueToken {
  id: string;
  tokenNumber: number;
  status: QueueStatus;
  orderId?: string;
  createdAt: string;
  calledAt?: string;
  servedAt?: string;
}

export const queueService = {
  /**
   * Update queue token status by token number
   * @param tokenNumber - The queue token number
   * @param status - The new status
   */
  async updateTokenStatusByNumber(
    tokenNumber: number,
    status: QueueStatus
  ): Promise<void> {
    console.log(`[Queue Service] Updating token ${tokenNumber} to ${status}`);

    // TODO: Implement actual queue update (local database + WebSocket)
    // For now, this is a no-op stub
  },
};
