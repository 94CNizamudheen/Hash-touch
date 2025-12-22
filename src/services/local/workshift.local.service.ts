
import { invoke } from "@tauri-apps/api/core";
import type { WorkShiftState } from "@/types/workshift";

export const workShiftLocal = {
  async getDraft(): Promise<WorkShiftState | null> {
    const res = await invoke<string | null>("get_work_shift_draft");
    return res ? (JSON.parse(res) as WorkShiftState) : null;
  },

  async saveDraft(data: WorkShiftState) {
    return invoke("save_work_shift_draft", {
      data: JSON.stringify(data),
    });
  },

  async clear() {
    return invoke("clear_work_shift_draft");
  },
};
