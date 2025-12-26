import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import i18n from "@/ui/i18n";
import { appStateApi } from "@/services/tauri/appState";
import { useEffect } from "react";

interface LanguageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const languages = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },

];

const LanguageModal = ({ isOpen, onClose }: LanguageModalProps) => {
  const { t } = useTranslation();
  const currentLanguage = i18n.language;

  useEffect(() => {
    document.body.dir = currentLanguage === "ar" ? "rtl" : "ltr";
  }, [currentLanguage]);

  const handleSelect = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      await appStateApi.setLanguage(languageCode);
      onClose();
    } catch (error) {
      console.error("Failed to change language:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-background rounded-lg shadow-xl w-full max-w-md max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {t("Select Language")}
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Language List */}
        <div className="overflow-y-auto flex-1 p-4">
          <div className="space-y-2">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang.code)}
                className={`
                  w-full flex items-center justify-between p-3 rounded-lg
                  transition-colors
                  ${
                    currentLanguage === lang.code
                      ? "bg-primary/10 border-2 border-primary"
                      : "bg-secondary/30 hover:bg-secondary/50 border-2 border-transparent"
                  }
                `}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium text-foreground">
                    {lang.nativeName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {lang.name}
                  </span>
                </div>
                {currentLanguage === lang.code && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground transition-colors"
          >
            {t("Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;