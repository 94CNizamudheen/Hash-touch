import { invoke } from "@tauri-apps/api/core";
import type { WorkdayPayload, LocalWorkday } from "@/types/workday";

export const workdayLocal = {
  /**
   * Save a workday to local database
   */
  async save(workdayData: WorkdayPayload, metadata?: {
    workdayId?: string;
    syncStatus?: "PENDING" | "SYNCING" | "SYNCED" | "FAILED";
  }): Promise<number> {
    const now = new Date().toISOString();

    // Rust expects snake_case field names
    const dbWorkday = {
      id: null,
      workday_id: metadata?.workdayId || null,
      start_user: workdayData.start_user || null,
      end_user: workdayData.end_user || null,
      start_time: workdayData.start_time || null,
      end_time: workdayData.end_time || null,
      location_id: workdayData.location_id,
      total_sales: workdayData.total_sales ?? null,
      total_taxes: workdayData.total_taxes ?? null,
      total_ticket_count: workdayData.total_ticket_count ?? null,
      work_period_informations: workdayData.work_period_informations || null,
      department_ticket_informations: workdayData.department_ticket_informations || null,
      add_on: workdayData.add_on || null,
      auto_closed: workdayData.auto_closed ?? null,
      external_processed: workdayData.external_processed ?? null,
      work_period_day: workdayData.work_period_day || null,
      business_date: workdayData.business_date || null,
      sync_status: metadata?.syncStatus || "PENDING",
      sync_error: null,
      created_at: now,
      updated_at: null,
    };

    const workdayId = await invoke<number>("save_workday", { workday: dbWorkday });
    return workdayId;
  },

  /**
   * Get all workdays from local database
   */
  getAll(): Promise<LocalWorkday[]> {
    return invoke("get_all_workdays");
  },

  /**
   * Get pending workdays (not synced yet)
   */
  getPending(): Promise<LocalWorkday[]> {
    return invoke("get_pending_workdays");
  },

  /**
   * Get the current active workday (no end_time set)
   */
  getActive(): Promise<LocalWorkday | null> {
    return invoke("get_active_workday");
  },

  /**
   * Get a workday by ID
   */
  getById(id: number): Promise<LocalWorkday | null> {
    return invoke("get_workday_by_id", { id });
  },

  /**
   * Update a workday
   */
  async update(id: number, updates: Partial<WorkdayPayload>): Promise<void> {
    const now = new Date().toISOString();

    await invoke("update_workday", {
      id,
      updates: {
        ...updates,
        updated_at: now,
      },
    });
  },

  /**
   * Update sync status of a workday
   */
  updateSyncStatus(
    id: number,
    status: "PENDING" | "SYNCING" | "SYNCED" | "FAILED",
    error?: string
  ): Promise<void> {
    return invoke("update_workday_sync_status", {
      id,
      status,
      error: error || null,
    });
  },

  /**
   * Set the workday ID from server after successful sync
   */
  setWorkdayId(id: number, workdayId: string): Promise<void> {
    return invoke("set_workday_server_id", { id, workday_id: workdayId });
  },

  /**
   * Delete a workday
   */
  delete(id: number): Promise<void> {
    return invoke("delete_workday", { id });
  },

  /**
   * Get workdays by date range
   */
  getByDateRange(startDate: string, endDate: string): Promise<LocalWorkday[]> {
    return invoke("get_workdays_by_date_range", { start_date: startDate, end_date: endDate });
  },

  /**
   * Get workdays by location
   */
  getByLocation(locationId: string): Promise<LocalWorkday[]> {
    return invoke("get_workdays_by_location", { location_id: locationId });
  },

  /**
   * Clear all workdays
   */
  clearAll(): Promise<void> {
    return invoke("clear_all_workdays");
  },
};
