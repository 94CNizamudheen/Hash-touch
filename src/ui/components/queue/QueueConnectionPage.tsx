
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Wifi, WifiOff, ArrowLeft } from "lucide-react";

import { appStateApi } from "@/services/tauri/appState";
import { useAppState } from "@/ui/hooks/useAppState";
import { useQueueWebSocket } from "@/ui/context/web-socket/QueueWebSocketContext";
import SplashScreen from "@/ui/components/common/SplashScreen";

export default function QueueConnectionPage() {
    const navigate = useNavigate();
    const { state: appState } = useAppState();

    const [serverUrl, setServerUrl] = useState("");
    const [inputUrl, setInputUrl] = useState("");
    const [showSplash, setShowSplash] = useState(false);

    const {
        isConnected,
        error,
        connect,
        disconnect,
    } = useQueueWebSocket();


    /* ---------------- Load saved URL ---------------- */
    useEffect(() => {
        const loadSettings = async () => {
            const [_, url] = await appStateApi.getWsSettings();
            if (url) {
                setServerUrl(url);
                setInputUrl(url);
            }
        };
        loadSettings();
    }, []);

    /* ---------------- Hide splash ---------------- */
    useEffect(() => {
        if (isConnected || error) {
            setTimeout(() => {
                setShowSplash(false)
            }, 0)
                ;
        }
    }, [isConnected, error]);

    /* ---------------- Connect ---------------- */
    const handleConnect = async () => {
        if (!inputUrl.trim()) {
            alert("Please enter POS server URL");
            return;
        }

        if (!appState?.device_role) {
            alert("Device role not found");
            return;
        }

        await appStateApi.setWsServerUrl(inputUrl);
        setServerUrl(inputUrl);

        setShowSplash(true);
        await connect(inputUrl|| appState.device_role);
    };

    /* ---------------- Disconnect ---------------- */
    const handleDisconnect = () => {
        disconnect();
    };

    if (showSplash) {
        return <SplashScreen type={3} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900  p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-6 text-background">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-lg hover:bg-gray-200"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-3xl font-bold ">Queue Communication</h1>
                </div>

                {/* Connected banner */}
                {isConnected && (
                    <div className="mb-4 rounded-lg border border-green-200 bg-green-50 p-4">
                        <div className="flex items-center gap-2 text-green-700 font-semibold">
                            <Wifi className="w-5 h-5" />
                            Connected to POS
                        </div>
                        <p className="text-sm text-green-600 mt-1">
                            Queue display is receiving live updates.
                        </p>
                    </div>
                )}

                {/* Card */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div
                                className={`w-12 h-12 rounded-full flex items-center justify-center ${isConnected ? "bg-green-100" : "bg-gray-100"
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
                                        ? "Listening for queue updates"
                                        : "Enter POS server address"}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* URL Input */}
                    <div className="space-y-4">
                        <input
                            value={inputUrl}
                            onChange={(e) => setInputUrl(e.target.value)}
                            placeholder="ws://192.168.1.100:9001"
                            className="w-full px-4 py-3 rounded-lg border font-mono text-sm"
                        />

                        {isConnected ? (
                            <button
                                onClick={handleDisconnect}
                                className="w-full px-6 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white"
                            >
                                Disconnect
                            </button>
                        ) : (
                            <button
                                onClick={handleConnect}
                                className="w-full px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                Connect
                            </button>
                        )}
                    </div>

                    {/* Saved URL */}
                    {serverUrl && (
                        <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
                            <p className="text-xs text-gray-600">Saved URL</p>
                            <p className="text-sm font-mono mt-1">{serverUrl}</p>
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
                            <p className="text-sm text-red-600">
                                <strong>Error:</strong> {error}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
