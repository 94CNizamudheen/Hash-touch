import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { WebSocketClient } from "@/services/websocket/WebSocketClient";
import { websocketService } from "@/services/websocket/websocket.service";
import { deviceService } from "@/services/local/device.local.service";
import { useAppState } from "@/ui/hooks/useAppState";
import { kdsTicketLocal } from "@/services/local/kds-ticket.local.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
import { useNotificationSound } from "../../hooks/useNotificationSound";

interface KdsWebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  client: WebSocketClient | null;
  connect: (wsUrl: string, deviceRole: string) => Promise<void>;
  disconnect: () => void;
}

const KdsWebSocketContext = createContext<KdsWebSocketContextType | undefined>(undefined);

export const KdsWebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { state, loading } = useAppState();
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<WebSocketClient | null>(null);
  const clientRef = useRef<WebSocketClient | null>(null);
  const hasAttemptedAutoConnect = useRef(false);
  const { playSound } = useNotificationSound();

  const connect = useCallback(async (wsUrl: string, deviceRole: string) => {
    // Skip for POS devices (they run as server)
    if (deviceRole === "POS") {
      console.log("[KdsWebSocketContext] POS device - skipping client connection");
      return;
    }

    // Validate URL
    if (!wsUrl || wsUrl.trim() === "") {
      setError("WebSocket URL is required");
      return;
    }

    // Get device info
    const device = await deviceService.getDevice();
    if (!device) {
      console.warn("[KdsWebSocketContext] No device found");
      setError("Device not found");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      console.log(`[KdsWebSocketContext] Connecting ${deviceRole} to ${wsUrl}`);

      // Disconnect existing connection if any
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }

      // Create WebSocket client
      const newClient = new WebSocketClient(wsUrl, device.id, deviceRole);

      // Connect
      await newClient.connect();
      await newClient.waitForRegisterAck();

      // Store client in service and state
      websocketService.setClient(newClient);
      clientRef.current = newClient;
      setClient(newClient);

      console.log("✅ [KdsWebSocketContext] WebSocket connected successfully");

      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ [KdsWebSocketContext] Connection failed:", errorMessage);

      setIsConnected(false);
      setIsConnecting(false);
      setError(errorMessage);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("[KdsWebSocketContext] Disconnecting WebSocket");
      clientRef.current.disconnect();
      clientRef.current = null;
      websocketService.setClient(null as any);
      setClient(null);

      setIsConnected(false);
      setIsConnecting(false);
      setError(null);
    }
  }, []);

  // Auto-connect on mount if device is KDS and URL is saved
  useEffect(() => {
    // Only run once after initial load
    if (loading || !state || hasAttemptedAutoConnect.current) return;

    // Only auto-connect for non-POS devices
    if (state.device_role === "POS") {
      hasAttemptedAutoConnect.current = true;
      return;
    }

    // If URL exists and not connected, auto-connect
    if (state.ws_server_url && !isConnected && !isConnecting) {
      console.log(
        "🔁 [KdsWebSocketContext] Auto-connecting using saved IP:",
        state.ws_server_url
      );
      hasAttemptedAutoConnect.current = true;

      // Schedule connection after current render to avoid cascading updates
      setTimeout(() => {
        connect(state.ws_server_url, state.device_role);
      }, 0);
    }
  }, [loading, state, isConnected, isConnecting, connect]);

  // Global WebSocket listener for incoming orders (KDS only)
  useEffect(() => {
    // Only listen for orders if we're a KDS device and connected
    if (!state || state.device_role === "POS" || !isConnected || !client) return;

    const handleNewOrder = async (message: any) => {
      console.log("[KdsWebSocketContext] 🆕 Received new_order globally:", message);

      const orderData = message.payload;

      // Play notification sound
      playSound();

      try {
        await kdsTicketLocal.saveTicket({
          id: orderData.ticket_id || `kds-${Date.now()}`,
          ticketNumber: String(orderData.ticket_number),
          orderId: orderData.ticket_id || "",
          locationId: orderData.location_id || "",
          orderModeName: orderData.order_mode || "Dine In",
          status:"IN_PROGRESS",
          items: JSON.stringify(orderData.items || []),
          totalAmount: orderData.total_amount || 0,
          tokenNumber: orderData.token_number || 0,
          createdAt: orderData.created_at || new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        console.log("[KdsWebSocketContext] ✅ Ticket saved to local database");

        // Emit local event so UI components can react
        localEventBus.emit(LocalEventTypes.TICKET_CREATED, orderData);

        // Optional: Show browser notification if page is not focused
        if (document.hidden && "Notification" in window && Notification.permission === "granted") {
          new Notification("New Order", {
            body: `Ticket #${orderData.ticket_number}`,
            icon: "/icon.png",
          });
        }
      } catch (error) {
        console.error("[KdsWebSocketContext] ❌ Failed to save ticket:", error);
      }
    };

    // Register the global listener
    console.log("[KdsWebSocketContext] 📡 Registering global new_order listener");
    client.on("new_order", handleNewOrder);

    // Cleanup when disconnecting
    return () => {
      console.log("[KdsWebSocketContext] 🔌 Removing global new_order listener");
      client.off("new_order", handleNewOrder);
    };
  }, [isConnected, client, state,playSound]);

  return (
    <KdsWebSocketContext.Provider
      value={{
        isConnected,
        isConnecting,
        error,
        client,
        connect,
        disconnect,
      }}
    >
      {children}
    </KdsWebSocketContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useKdsWebSocket = () => {
  const context = useContext(KdsWebSocketContext);
  if (!context) {
    throw new Error("useKdsWebSocket must be used within KdsWebSocketProvider");
  }
  return context;
};
