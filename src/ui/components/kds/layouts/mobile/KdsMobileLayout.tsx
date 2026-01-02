import { Outlet } from "react-router-dom";
import { useEffect } from "react";
import MobileKdsHeader from "./MobileKdsHeader";
import MobileKdsFooter from "./MobileKdsFooter";
import { useAppState } from "@/ui/hooks/useAppState";
import { useWebSocketConnection } from "@/ui/hooks/useWebSocketConnection";

const KdsMobileLayout = () => {
  const { state, loading } = useAppState();

  const {
    isConnected,
    isConnecting,
    connect,
  } = useWebSocketConnection({
    onConnected: () => {
      console.log("✅ [Mobile KDS] Connected to POS");
    },
    onDisconnected: () => {
      console.log("🔌 [Mobile KDS] Disconnected from POS");
    },
    onError: (err) => {
      console.error("❌ [Mobile KDS] Connection error:", err.message);
    },
  });

  // 🔁 AUTO CONNECT USING SAVED IP (AFTER REFRESH / RESTART)
  useEffect(() => {
    if (loading || !state) return;

    // POS should NOT act as client
    if (state.device_role === "POS") return;

    // If URL exists & not connected → auto connect
    if (
      state.ws_server_url &&
      !isConnected &&
      !isConnecting
    ) {
      console.log(
        "🔁 [Mobile KDS] Auto connecting using saved IP:",
        state.ws_server_url
      );
      connect(state.ws_server_url, state.device_role);
    }
  }, [
    loading,
    state,
    isConnected,
    isConnecting,
    connect,
  ]);

  return (
    <div className="flex flex-col h-screen bg-white safe-area">
      <MobileKdsHeader />

      <main className="flex-1 overflow-auto px-3 py-2">
        <Outlet />
      </main>

      <MobileKdsFooter
        wsConnected={isConnected}
        lastSync={new Date().toLocaleTimeString()}
      />

    </div>
  );
};

export default KdsMobileLayout;
