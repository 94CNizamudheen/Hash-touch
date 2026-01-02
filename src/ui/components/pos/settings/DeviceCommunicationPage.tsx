import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/ui/shadcn/components/ui/card";
import { Wifi,Server } from "lucide-react";
import { useEffect, useState } from "react";
import { appStateApi } from "@/services/tauri/appState";
import { useAppState } from "@/ui/hooks/useAppState";

export default function DeviceCommunicationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state: appState } = useAppState();
  const [serverUrl, setServerUrl] = useState("");
  const [editingUrl, setEditingUrl] = useState("");
  const [localIp, setLocalIp] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isPOS = appState?.device_role === "POS";

  useEffect(() => {
    // Load WebSocket settings
    const loadSettings = async () => {
      try {
        const [_, url] = await appStateApi.getWsSettings();
        setServerUrl(url);
        setEditingUrl(url);
      } catch (error) {
        console.error("Failed to load WebSocket settings:", error);
      }
    };
    loadSettings();
    const getLocalIP = async () => {
      try {
        if (isPOS) {
          const ip = await appStateApi.getIpAddress();
          setLocalIp(ip);
        }
      } catch (error) {
        console.error("Failed to get local IP:", error);
      }
    };
    getLocalIP();

    getLocalIP();
  }, [isPOS]);

  const handleSaveUrl = async () => {
    if (!editingUrl.trim()) {
      alert("Please enter a valid WebSocket URL");
      return;
    }

    setSaving(true);
    try {
      await appStateApi.setWsServerUrl(editingUrl);
      setServerUrl(editingUrl);
      alert("WebSocket URL saved. Please restart the app for changes to take effect.");
    } catch (error) {
      console.error("Failed to update WebSocket URL:", error);
      alert("Failed to update WebSocket URL");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("Device Communication")}</h1>
        <button
          onClick={() => navigate("/pos/settings")}
          className="px-4 py-2 rounded-lg bg-secondary hover:bg-sidebar-hover text-foreground font-medium"
        >
          {t("Back to Settings")}
        </button>
      </div>

      {/* Device Role Status */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Server className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">
              {isPOS ? "WebSocket Server (POS)" : `WebSocket Client (${appState?.device_role})`}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {isPOS
                ? "This POS device is running as the WebSocket server"
                : "This device connects to a POS device as a client"}
            </p>
          </div>
          {isPOS && (
            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium">
              Server Running
            </span>
          )}
        </div>

        {isPOS && localIp && (
          <div className="mt-4 p-4 bg-secondary rounded-lg">
            <p className="text-sm font-medium mb-2">Other devices should connect to:</p>
            <code className="bg-background px-3 py-2 rounded text-sm block font-mono">
              ws://{localIp}:9001
            </code>
          </div>
        )}
      </Card>

      {/* WebSocket Connection URL (Non-POS only) */}
      {!isPOS && (
        <Card className="p-6">
          <div className="flex items-center gap-4 mb-4">
            <Wifi className="w-8 h-8 text-primary" />
            <div className="flex-1">
              <h2 className="text-xl font-semibold">{t("POS Server Connection")}</h2>
              <p className="text-sm text-muted-foreground mt-1">
                URL of the POS device to connect to
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              value={editingUrl}
              onChange={(e) => setEditingUrl(e.target.value)}
              placeholder="ws://192.168.1.100:9001"
              className="flex-1 px-4 py-2 rounded-lg border border-border bg-background text-foreground font-mono"
            />
            <button
              onClick={handleSaveUrl}
              disabled={saving || editingUrl === serverUrl}
              className="px-6 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Save"}
            </button>
          </div>

          <p className="text-xs text-muted-foreground mt-3">
            Current: <span className="font-mono">{serverUrl}</span>
          </p>
        </Card>
      )}
    </div>
  );
}
