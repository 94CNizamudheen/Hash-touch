import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import enTranslation from "./locales/en/translation.json";
import arTranslation from "./locales/ar/translation.json";
import { appStateApi } from "@/services/tauri/appState";

// Initialize with default language
let savedLanguage = "en";

// Fetch language from appState
appStateApi.get().then((appState) => {
  const language = appState.language || "en";
  savedLanguage = language;
  document.body.dir = language === "ar" ? "rtl" : "ltr";
  if (i18n.isInitialized) {
    i18n.changeLanguage(language);
  }
}).catch(() => {
  // If appState fetch fails, use default
  savedLanguage = "en";
});

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translation: enTranslation,
    },
    ar: {
      translation: arTranslation,
    },
  },
  lng: savedLanguage,
  fallbackLng: "en",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
