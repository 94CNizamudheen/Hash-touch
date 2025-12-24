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

  const newState = await new Promise<AppState | null>((resolve) => {
    setState((prev) => {
      if (!prev) {
        resolve(prev);
        return prev;
      }

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

      resolve(updated);
      return updated;
    });
  });

  console.log("✅ State update complete, new order_mode_id:", newState?.selected_order_mode_id);
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
