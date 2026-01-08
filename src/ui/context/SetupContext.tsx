import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { setupLocal, type DbSetup } from "@/services/local/setup.local.service";

interface SetupContextType {
  setup: DbSetup | null;
  settings: any[];
  currencyCode: string;
  currencySymbol: string;
  loading: boolean;
  refresh: (code: string) => Promise<void>;
}

const SetupContext = createContext<SetupContextType | null>(null);

export const SetupProvider = ({
  setupCode,
  children,
}: {
  setupCode: string;
  children: React.ReactNode;
}) => {
  const [setup, setSetup] = useState<DbSetup | null>(null);
  const [loading, setLoading] = useState(true);

  /* =========================
     Load setup from SQLite
  ========================= */
  const load = useCallback(async (code: string) => {
    try {
      setLoading(true);
      const localSetup = await setupLocal.getByCode(code);
      setSetup(localSetup);
    } catch (err) {
      console.error("[SetupContext] Failed to load setup:", err);
      setSetup(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (setupCode) {
      load(setupCode);
    }
  }, [setupCode, load]);

  /* =========================
     Parsed settings (SAFE)
  ========================= */
  const settings = useMemo(() => {
    if (!setup?.settings) return [];

    try {
      return setup.settings.trim()
        ? JSON.parse(setup.settings)
        : [];
    } catch (e) {
      console.warn("[SetupContext] Invalid setup settings JSON");
      return [];
    }
  }, [setup?.settings]);

  /* =========================
     Currency (from setup)
  ========================= */
  const currencyCode = useMemo(() => {
    return setup?.currency_code || "USD";
  }, [setup?.currency_code]);

  const currencySymbol = useMemo(() => {
    return setup?.currency_symbol || "$";
  }, [setup?.currency_symbol]);

  /* =========================
     Public refresh API
  ========================= */
  const refresh = useCallback(
    async (code: string) => {
      await load(code);
    },
    [load]
  );

  const value = useMemo(
    () => ({
      setup,
      settings,
      currencyCode,
      currencySymbol,
      loading,
      refresh,
    }),
    [setup, settings, currencyCode, currencySymbol, loading, refresh]
  );

  return (
    <SetupContext.Provider value={value}>
      {children}
    </SetupContext.Provider>
  );
};

/* =========================
   Hook
========================= */
// eslint-disable-next-line react-refresh/only-export-components
export const useSetup = () => {
  const ctx = useContext(SetupContext);
  if (!ctx) {
    throw new Error("useSetup must be used within <SetupProvider>");
  }
  return ctx;
};
