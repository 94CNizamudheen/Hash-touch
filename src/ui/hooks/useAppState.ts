import { useEffect, useState, useCallback } from "react";
import { appStateApi } from "@/services/tauri/appState";
import type { AppState } from "@/types/app-state";

export const useAppState = () => {
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

  const refresh = async () => {
    setLoading(true);
    await load();
  };

  const setOrderMode = async (
    orderModeIds: string[],
    orderModeNames: string[],
    defaultModeId: string,
    defaultModeName: string
  ) => {
    await appStateApi.setOrderMode(
      orderModeIds,
      orderModeNames,
      defaultModeId,
      defaultModeName
    );
    await refresh();
  };

  const setTheme = async (theme: string) => {
    await appStateApi.setTheme(theme);
    setState((prev) =>
      prev ? { ...prev, theme } : prev
    );
  };

  const setLanguage = async (language: string) => {
    await appStateApi.setLanguage(language);
    setState((prev) =>
      prev ? { ...prev, language } : prev
    );
  };

  return {
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
  };
};
