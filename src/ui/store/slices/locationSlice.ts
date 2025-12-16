

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { locationService } from "@services/auth/location.service";
import { locationLocal, type DbLocation } from "@/services/local/location.local.service";

interface LocationState {
  items: DbLocation[];
  loading: boolean;
}

const initialState: LocationState = {
  items: [],
  loading: false,
};

export const fetchAndStoreLocations = createAsyncThunk(
  "location/fetchAndStore",
  async ({ domain, token }: { domain: string; token: string }) => {

    const res = await locationService.fetchLocations(domain, token);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const locations: DbLocation[] = res.data.map((l: any) => ({
      server_id: l.id,
      name: l.name,
      active: Boolean(l.active),
      selected: false,
    }));

    await locationLocal.save(locations);


    return await locationLocal.getAll();
  }
);

export const selectLocation = createAsyncThunk(
  "location/select",
  async (serverId: string) => {
    await locationLocal.select(serverId);
    return await locationLocal.getAll();
  }
);

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAndStoreLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchAndStoreLocations.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(selectLocation.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export default locationSlice.reducer;
