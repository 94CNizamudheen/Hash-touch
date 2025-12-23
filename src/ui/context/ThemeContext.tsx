
import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

import { appStateApi } from "@/services/tauri/appState"; 

interface ThemeContextType {
  theme: string;
  language: string;
  isHydrated: boolean;

  setTheme: (t: string) => void;
  setLanguage: (l: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState("light");
  const [language, setLanguageState] = useState("en");
  const [isHydrated, setIsHydrated] = useState(false);


  useEffect(() => {
    const hydrate = async () => {
      try {
        const state = await appStateApi.get();
        if (state?.theme) setThemeState(state.theme);
        if (state?.language) setLanguageState(state.language);
      } catch (e) {
        console.error("Theme hydrate failed:", e);
      } finally {
        setIsHydrated(true);
      }
    };

    hydrate();
  }, []);


  useEffect(() => {
    if (!isHydrated) return;
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    document.body.dir = language === "ar" ? "rtl" : "ltr";
  }, [language, isHydrated]);


  const setTheme = (t: string) => {
    setThemeState(t);
    if (isHydrated) appStateApi.setTheme(t).catch(console.error);
  };

  const setLanguage = (l: string) => {
    setLanguageState(l);
    if (isHydrated) appStateApi.setLanguage(l).catch(console.error);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        language,
        isHydrated,
        setTheme,
        setLanguage,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
};
