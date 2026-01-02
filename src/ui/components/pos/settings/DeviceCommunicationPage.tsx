import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/ui/shadcn/components/ui/card";
import {  Server, Copy, Check } from "lucide-react";
import { useEffect, useState } from "react";
import { appStateApi } from "@/services/tauri/appState";
import { useAppState } from "@/ui/hooks/useAppState";

export default function DeviceCommunicationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { state: appState } = useAppState();

  const [localIp, setLocalIp] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  const isPOS = appState?.device_role === "POS";

  useEffect(() => {
    
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




  const handleCopyIp = async () => {
    if (!localIp) return;
    const wsUrl = `ws://${localIp}:9001`;
    try {
      await navigator.clipboard.writeText(wsUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
      alert("Failed to copy to clipboard");
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
            <div className="flex gap-2 items-center">
              <code className="flex-1 bg-background px-3 py-2 rounded text-sm font-mono">
                ws://{localIp}:9001
              </code>
              <button
                onClick={handleCopyIp}
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-colors flex items-center gap-2"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </Card>

    </div>
  );
}
