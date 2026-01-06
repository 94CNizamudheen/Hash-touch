
import { invoke } from "@tauri-apps/api/core";
import type { QueueTokenData, QueueStatus } from "@/types/queue";

export const queueTokenLocal = {
  async saveToken(token: QueueTokenData): Promise<void> {
    await invoke("save_queue_token", { token });
  },

  async getActiveTokens(): Promise<QueueTokenData[]> {
    return await invoke("get_active_queue_tokens");
  },

  async updateStatus(
    tokenNumber: number,
    status: QueueStatus
  ): Promise<void> {
    await invoke("update_queue_token_status", {
      tokenNumber,
      status,
    });
  },
};
