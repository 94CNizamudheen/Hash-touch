

import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AppState, DeviceRole } from "@/types/app-state";

const initialState: AppState = {
  tenant_domain: null,
  access_token: null,
  selected_location_id: null,
  order_mode_ids: [],
  brand_id: null,
  device_role: null,
  sync_status: null,
};

const appStateSlice = createSlice({
  name: "appState",
  initialState,
  reducers: {
    hydrateAppState(
      _,
      action: PayloadAction<AppState>
    ) {
      return action.payload;
    },

    setDeviceRole(
      state,
      action: PayloadAction<DeviceRole>
    ) {
      state.device_role = action.payload;
    },

    setSyncStatus(
      state,
      action: PayloadAction<AppState["sync_status"]>
    ) {
      state.sync_status = action.payload;
    },
  },
});

export const {
  hydrateAppState,
  setDeviceRole,
  setSyncStatus,
} = appStateSlice.actions;

export default appStateSlice.reducer;
