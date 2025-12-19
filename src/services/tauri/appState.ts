
import { invoke } from "@tauri-apps/api/core";
import type { AppState, DeviceRole } from "@/types/app-state";

export const appStateApi = {
  get(): Promise<AppState> {
    console.log("Invoking get_app_state");
    return invoke("get_app_state");
  },

  setTenant(domain: string, token: string): Promise<void> {
    return invoke("set_tenant", { domain, token });
  },

  setLocation(locationId: string, brandId: string): Promise<void> {
    return invoke("set_location", { locationId, brandId });
  },

  setDeviceRole(role: DeviceRole): Promise<void> {
    return invoke("set_device_role", { role });
  },
  setOrderModeIds(orderModeIds: string[]): Promise<void> {
    return invoke("set_order_mode_ids", { orderModeIds });
  }
};
