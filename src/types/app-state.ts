export type DeviceRole = "POS" | "KIOSK" | "QUEUE" | "KDS";

export type SyncStatus = "IDLE" | "SYNCING" | "DONE" | "FAILED";

export interface AppState {
  tenant_domain: string | null;
  access_token: string | null;
  selected_location_name?: string | null;
  order_mode_names?: string[];
  selected_location_id: string | null;
  brand_id: string | null;
  order_mode_ids: string[];
  theme?: string | null;
  language?: string | null;
  direction?: string | null;

  selected_order_mode_id?: string | null;
  selected_order_mode_name?: string | null;

  device_role: DeviceRole | null;
  sync_status: SyncStatus | null;

  ws_server_mode?: number | null;
  ws_server_url?: string | null;
  setup_code?:string|null
}
