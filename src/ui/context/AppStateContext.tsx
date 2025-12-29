import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { appStateApi } from "@/services/tauri/appState";
import type { AppState } from "@/types/app-state";

interface AppStateContextType {
  state: AppState | null;
  loading: boolean;
  selectedLocationName: string;
  orderModeNames: string[];
  selectedOrderModeId: string | null;
  selectedOrderModeName: string | null;
  refresh: () => Promise<void>;
  setOrderMode: (
    orderModeIds: string[],
    orderModeNames: string[],
    selectedId: string,
    selectedName: string
  ) => Promise<void>;
  setTheme: (theme: string) => Promise<void>;
  setLanguage: (language: string) => Promise<void>;
}

const AppStateContext = createContext<AppStateContextType | null>(null);

export const AppStateProvider = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppState | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const s = await appStateApi.get();
      setState(s);
    } catch (e) {
      console.error("Failed to load app_state:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const refresh = useCallback(async () => {
    setLoading(true);
    await load();
  }, [load]);

  const setOrderMode = useCallback(async (
    orderModeIds: string[],
    orderModeNames: string[],
    selectedId: string,
    selectedName: string
  ) => {
    console.log("🔄 setOrderMode called with:", {
      selectedId,
      selectedName,
      orderModeIds,
      orderModeNames
    });

    await appStateApi.setOrderMode(
      orderModeIds,
      orderModeNames,
      selectedId,
      selectedName
    );

    console.log("✅ Backend updated, updating local state");

    setState((prev) => {
      if (!prev) return prev;

      const updated = {
        ...prev,
        order_mode_ids: orderModeIds,
        order_mode_names: orderModeNames,
        selected_order_mode_id: selectedId,
        selected_order_mode_name: selectedName,
      };

      console.log("📝 New state:", {
        old_order_mode_id: prev.selected_order_mode_id,
        new_order_mode_id: updated.selected_order_mode_id,
        state_changed: prev.selected_order_mode_id !== updated.selected_order_mode_id
      });

      return updated;
    });

    console.log("✅ State update complete, new order_mode_id:", selectedId);
  }, []);

  const setTheme = useCallback(async (theme: string) => {
    await appStateApi.setTheme(theme);
    setState((prev) =>
      prev ? { ...prev, theme } : prev
    );
  }, []);

  const setLanguage = useCallback(async (language: string) => {
    await appStateApi.setLanguage(language);
    setState((prev) =>
      prev ? { ...prev, language } : prev
    );
  }, []);

  const value = useMemo(
    () => ({
      state,
      loading,
      selectedLocationName: state?.selected_location_name ?? "",
      orderModeNames: state?.order_mode_names ?? [],
      selectedOrderModeId: state?.selected_order_mode_id ?? null,
      selectedOrderModeName: state?.selected_order_mode_name ?? null,
      refresh,
      setOrderMode,
      setTheme,
      setLanguage,
    }),
    [state, loading, refresh, setOrderMode, setTheme, setLanguage]
  );

  return (
    <AppStateContext.Provider value={value}>
      {children}
    </AppStateContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAppState = () => {
  const ctx = useContext(AppStateContext);
  if (!ctx) {
    throw new Error("useAppState must be used within <AppStateProvider>");
  }
  return ctx;
};
