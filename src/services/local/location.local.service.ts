
import { invoke } from "@tauri-apps/api/core";

export interface DbLocation {
  server_id: string;
  name: string;
  active: boolean;
  selected: boolean;
}

export const locationLocal = {
  save(locations: DbLocation[]) {
    return invoke("save_locations", { locations });
  },

  getAll(): Promise<DbLocation[]> {
    return invoke("get_locations");
  },

  select(serverId: string) {
    return invoke("select_location", { serverId });
  },
};
