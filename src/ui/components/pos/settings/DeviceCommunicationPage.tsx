import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Card } from "@/ui/shadcn/components/ui/card";
import { Wifi, Monitor, Grid3x3, Laptop } from "lucide-react";
import { useEffect, useState } from "react";

export default function DeviceCommunicationPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [serverUrl, setServerUrl] = useState("ws://localhost:9001");

  useEffect(() => {
    // Get local IP for network devices
    const getLocalIP = async () => {
      try {
        const hostname = window.location.hostname;
        if (hostname !== "localhost" && hostname !== "127.0.0.1") {
          setServerUrl(`ws://${hostname}:9001`);
        }
      } catch (error) {
        console.error("Failed to get local IP:", error);
      }
    };
    getLocalIP();
  }, []);

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

      {/* WebSocket Status */}
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <Wifi className="w-8 h-8 text-primary" />
          <div className="flex-1">
            <h2 className="text-xl font-semibold">{t("WebSocket Server")}</h2>
            <p className="text-sm text-muted-foreground font-mono mt-1">{serverUrl}</p>
          </div>
          <div>
            <span className="px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-sm font-medium">
              Running
            </span>
          </div>
        </div>
      </Card>

      {/* Device Types */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Monitor className="w-6 h-6 text-primary" />
            <h3 className="font-semibold">{t("Kitchen Display")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">Real-time order updates</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Grid3x3 className="w-6 h-6 text-primary" />
            <h3 className="font-semibold">{t("Queue Display")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">Customer queue screens</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-3">
            <Laptop className="w-6 h-6 text-primary" />
            <h3 className="font-semibold">{t("POS Terminal")}</h3>
          </div>
          <p className="text-sm text-muted-foreground">Multi-terminal sync</p>
        </Card>
      </div>

      {/* Connection Setup */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">{t("Connection Setup")}</h2>
        <div className="space-y-3 text-muted-foreground">
          <div className="flex items-start gap-3">
            <span className="text-primary font-semibold mt-0.5">1.</span>
            <p>Connect all devices to the same local network</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-semibold mt-0.5">2.</span>
            <div>
              <p className="mb-2">Configure device to connect to:</p>
              <code className="bg-secondary px-3 py-2 rounded text-sm block font-mono">
                {serverUrl}
              </code>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="text-primary font-semibold mt-0.5">3.</span>
            <p>Devices will register automatically upon connection</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
