
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

  setLocation(locationId: string, brandId: string,locationName:string): Promise<void> {
    return invoke("set_location", { locationId, brandId ,locationName});
  },

  setDeviceRole(role: DeviceRole): Promise<void> {
    return invoke("set_device_role", { role });
  },
  setOrderMode(orderModeIds: string[],orderModeNames:string[],defaultModeId:string,defaultModeName:string): Promise<void> {
    return invoke("set_order_modes", { orderModeIds ,orderModeNames,defaultModeId,defaultModeName});
  },
  setTheme(theme: string): Promise<void> {
    return invoke("set_theme", { theme });
  },

  setLanguage(language: string): Promise<void> {
    return invoke("set_language", { language });
  },
  clear():Promise<void>{
    return invoke("clear_app_state");
  },

  clearAllData():Promise<void>{
    return invoke("clear_all_data");
  },

  // WebSocket settings
  getWsSettings(): Promise<[boolean, string]> {
    return invoke("get_ws_settings");
  },

  setWsServerMode(enabled: boolean): Promise<void> {
    return invoke("set_ws_server_mode", { enabled });
  },

  setWsServerUrl(url: string): Promise<void> {
    return invoke("set_ws_server_url", { url });
  },
  getIpAddress():Promise<string>{
    return invoke('get_local_ip')
  }
};
