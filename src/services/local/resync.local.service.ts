

import { invoke } from "@tauri-apps/api/core";

export const resyncLocal = {
  clearBusinessData(): Promise<void> {
    console.log("🧹 Clearing local business data before re-sync");
    return invoke("clear_resync_data");
  },
};
