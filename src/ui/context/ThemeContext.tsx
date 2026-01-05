
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
  direction: string;
  isHydrated: boolean;

  setTheme: (t: string) => void;
  setLanguage: (l: string) => void;
  setDirection: (d: string) => void;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState("light");
  const [language, setLanguageState] = useState("en");
  const [direction, setDirectionState] = useState("ltr");
  const [isHydrated, setIsHydrated] = useState(false);


  useEffect(() => {
    const hydrate = async () => {
      try {
        const state = await appStateApi.get();
        if (state?.theme) setThemeState(state.theme);
        if (state?.language) setLanguageState(state.language);
        if (state?.direction) setDirectionState(state.direction);
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
    document.body.dir = direction;
  }, [direction, isHydrated]);


  const setTheme = (t: string) => {
    setThemeState(t);
    if (isHydrated) appStateApi.setTheme(t).catch(console.error);
  };

  const setLanguage = (l: string) => {
    setLanguageState(l);
    if (isHydrated) appStateApi.setLanguage(l).catch(console.error);
  };

  const setDirection = (d: string) => {
    setDirectionState(d);
    if (isHydrated) appStateApi.setDirection(d).catch(console.error);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        language,
        direction,
        isHydrated,
        setTheme,
        setLanguage,
        setDirection,
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
