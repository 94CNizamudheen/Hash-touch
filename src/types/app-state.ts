export type DeviceRole = "POS" | "KIOSK" | "QUEUE" | "KDS";

export type SyncStatus = "IDLE" | "SYNCING" | "DONE" | "FAILED";

export interface AppState {
  tenant_domain: string | null;
  access_token: string | null;

  selected_location_id: string | null;
  brand_id: string | null;
  order_mode_ids: string[];

  device_role: DeviceRole | null;
  sync_status: SyncStatus | null;
}
