import { Outlet } from "react-router-dom";
import KDSTicketHeader from "./KDSTicketHeader";
import KDSTicketsFooter from "./KDSTicketsFooter";
import { useEffect } from "react";
import { useAppState } from "@/ui/hooks/useAppState";
import { useWebSocketConnection } from "@/ui/hooks/useWebSocketConnection";

const KDSTicketsDesktopLayout = () => {
  const { state, loading } = useAppState();

  const {
    isConnected,
    isConnecting,
    connect,
  } = useWebSocketConnection({
    onConnected: () => {
      console.log("✅ Auto-connected to POS");
    },
    onError: (err) => {
      console.error("❌ Auto-connect failed:", err.message);
    },
  });

  useEffect(() => {
    if (loading || !state) return;

    if (
      state.device_role !== "POS" &&
      state.ws_server_url &&
      !isConnected &&
      !isConnecting
    ) {
      console.log("🔁 Auto-connect using saved IP:", state.ws_server_url);
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
    <div className="flex flex-col h-screen bg-gray-50">
      <KDSTicketHeader />

      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>

      <KDSTicketsFooter wsConnected={isConnected} />
    </div>
  );
};

export default KDSTicketsDesktopLayout;
