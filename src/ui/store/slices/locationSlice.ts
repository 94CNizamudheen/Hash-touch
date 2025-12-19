import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";

export interface Location {
  id: string;
  brand_id: string;
  name: string;
  active: boolean;
  selected?: boolean;
}

interface LocationState {
  items: Location[];
  loading: boolean;
}

const initialState: LocationState = {
  items: [],
  loading: false,
};

/* =========================
   Helpers
========================= */
const readLocations = (): Location[] => {
  try {
    return JSON.parse(localStorage.getItem("locations") || "[]");
  } catch {
    return [];
  }
};

const writeLocations = (locations: Location[]) => {
  localStorage.setItem("locations", JSON.stringify(locations));
};

/* =========================
   Thunks
========================= */

/**
 * Load locations from localStorage into Redux
 */
export const loadLocations = createAsyncThunk(
  "location/load",
  async () => {
    return readLocations();
  }
);

/**
 * Save locations once (after sync / mock / bootstrap)
 */
export const saveLocations = createAsyncThunk(
  "location/save",
  async (locations: Location[]) => {
    writeLocations(locations);
    return locations;
  }
);

/**
 * Select a location
 */
export const selectLocation = createAsyncThunk(
  "location/select",
  async (locationId: string) => {
    const locations = readLocations().map((l) => ({
      ...l,
      selected: l.id === locationId,
    }));

    writeLocations(locations);
    localStorage.setItem("selected_location_id", locationId);

    return locations;
  }
);

/* =========================
   Slice
========================= */
const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    clearLocations(state) {
      state.items = [];
      localStorage.removeItem("locations");
      localStorage.removeItem("selected_location_id");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadLocations.pending, (state) => {
        state.loading = true;
      })
      .addCase(loadLocations.fulfilled, (state, action) => {
        state.items = action.payload;
        state.loading = false;
      })
      .addCase(saveLocations.fulfilled, (state, action) => {
        state.items = action.payload;
      })
      .addCase(selectLocation.fulfilled, (state, action) => {
        state.items = action.payload;
      });
  },
});

export const { clearLocations } = locationSlice.actions;
export default locationSlice.reducer;
