import { useNavigate } from "react-router-dom";
import { SETTINGS_MENU } from "@/ui/constants/settings";
import { useTranslation } from "react-i18next";
import { ChevronRight } from "lucide-react";

export default function SettingsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full bg-background text-foreground">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-border">
        <h1 className="text-3xl font-bold">{t("Settings")}</h1>
      </div>

      {/* Settings Menu */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-2xl mx-auto space-y-3">
          {SETTINGS_MENU.map((setting) => (
            <div
              key={setting.id}
              onClick={() => navigate(setting.href)}
              className="bg-secondary flex items-center justify-between p-5 rounded-lg border border-border bg-card hover:bg-sidebar-hover cursor-pointer transition-all hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="text-primary">{setting.icon}</div>
                <div>
                  <p className="text-foreground font-semibold text-lg">
                    {t(setting.title)}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {setting.title === "Printer Settings"
                      ? t("Manage receipt printers")
                      : t("WebSocket server for KDS & Queue displays")}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-muted-foreground" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
