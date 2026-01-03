import { Outlet } from "react-router-dom";
import KDSTicketHeader from "./KDSTicketHeader";
import KDSTicketsFooter from "./KDSTicketsFooter";
import { KdsWebSocketProvider, useKdsWebSocket } from "@/ui/context/KdsWebSocketContext";

const KDSTicketsDesktopLayoutContent = () => {
  const { isConnected } = useKdsWebSocket();

  return (
    <div className="flex flex-col h-screen bg-gray-50 safe-area">
      <KDSTicketHeader />

      <main className="flex-1 overflow-auto p-4">
        <Outlet />
      </main>

      <KDSTicketsFooter wsConnected={isConnected} />
    </div>
  );
};

const KDSTicketsDesktopLayout = () => {
  return (
    <KdsWebSocketProvider>
      <KDSTicketsDesktopLayoutContent />
    </KdsWebSocketProvider>
  );
};

export default KDSTicketsDesktopLayout;
