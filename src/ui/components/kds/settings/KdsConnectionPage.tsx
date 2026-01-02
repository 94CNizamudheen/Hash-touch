import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, WifiOff, ArrowLeft } from "lucide-react";
import { appStateApi } from "@/services/tauri/appState";
import { useAppState } from "@/ui/hooks/useAppState";
import { useWebSocketConnection } from "@/ui/hooks/useWebSocketConnection";
import SplashScreen from "@/ui/components/common/SplashScreen";

export default function KdsConnectionPage() {
  const navigate = useNavigate();
  const { state: appState } = useAppState();

  const [serverUrl, setServerUrl] = useState("");
  const [inputUrl, setInputUrl] = useState("");
  const [showSplash, setShowSplash] = useState(false);

  const {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  } = useWebSocketConnection({
    onConnected: () => {
      console.log("✅ Connected to POS");
      setShowSplash(false);
    },
    onDisconnected: () => {
      console.log("🔌 Disconnected from POS");
    },
    onError: (err) => {
      console.error("❌ Connection error:", err.message);
      setShowSplash(false);
    },
  });

  /* =========================
     LOAD SAVED URL (ONCE)
  ========================= */
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [_, url] = await appStateApi.getWsSettings();
        if (url) {
          setServerUrl(url);
          setInputUrl(url);
        }
      } catch (e) {
        console.error("Failed to load WebSocket settings:", e);
      }
    };
    loadSettings();
  }, []);

  /* =========================
     AUTO REDIRECT IF CONNECTED
  ========================= */
  useEffect(() => {
    if (isConnected) {
      const t = setTimeout(() => {
        navigate(-1); // back to settings
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [isConnected, navigate]);

  /* =========================
     CONNECT
  ========================= */
  const handleConnect = async () => {
    if (!inputUrl.trim()) {
      alert("Please enter a POS server URL");
      return;
    }

    if (!appState?.device_role) {
      alert("Device role not found");
      return;
    }

    try {
      await appStateApi.setWsServerUrl(inputUrl);
      setServerUrl(inputUrl);
    } catch {
      alert("Failed to save WebSocket URL");
      return;
    }

    setShowSplash(true);
    await connect(inputUrl, appState.device_role);
  };

  /* =========================
     DISCONNECT
  ========================= */
  const handleDisconnect = () => {
    disconnect();
  };

  if (showSplash || isConnecting) {
    return <SplashScreen type={3} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-lg hover:bg-gray-200"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-3xl font-bold">Connect to POS</h1>
        </div>

        {/* ✅ ALREADY CONNECTED BANNER */}
        {isConnected && (
          <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-center gap-2 text-green-700 font-semibold">
              <Wifi className="w-5 h-5" />
              Already connected to POS
            </div>
            <p className="text-sm text-green-600 mt-1">
              This device is actively receiving orders.
            </p>
          </div>
        )}

        {/* Connection Card */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  isConnected ? "bg-green-100" : "bg-gray-100"
                }`}
              >
                {isConnected ? (
                  <Wifi className="w-6 h-6 text-green-600" />
                ) : (
                  <WifiOff className="w-6 h-6 text-gray-600" />
                )}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {isConnected ? "Connected" : "Not Connected"}
                </h2>
                <p className="text-sm text-gray-600">
                  {isConnected
                    ? "Receiving orders from POS"
                    : "Enter POS server address to connect"}
                </p>
              </div>
            </div>

            {isConnected && (
              <span className="px-4 py-2 rounded-full bg-green-100 text-green-600 text-sm font-medium">
                Active
              </span>
            )}
          </div>

          {/* URL INPUT */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                POS Server URL
              </label>
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                placeholder="ws://192.168.1.100:9001"
                disabled={isConnected}
                className="w-full px-4 py-3 rounded-lg border font-mono text-sm disabled:bg-gray-100"
              />
            </div>

            {/* ACTION BUTTON */}
            {isConnected ? (
              <button
                onClick={handleDisconnect}
                className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium flex items-center justify-center gap-2"
              >
                <WifiOff className="w-5 h-5" />
                Disconnect
              </button>
            ) : (
              <button
                onClick={handleConnect}
                disabled={!inputUrl.trim()}
                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium disabled:bg-gray-300"
              >
                <Wifi className="w-5 h-5 inline mr-2" />
                Connect
              </button>
            )}
          </div>

          {/* ERROR */}
          {error && (
            <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
              <p className="text-sm text-red-600">
                <strong>Connection Failed:</strong> {error}
              </p>
            </div>
          )}

          {/* SAVED URL */}
          {serverUrl && (
            <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
              <p className="text-xs text-gray-600">Saved URL</p>
              <p className="text-sm font-mono mt-1">{serverUrl}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
