/* eslint-disable react-refresh/only-export-components */
// src/ui/context/QueueWebSocketContext.tsx
import {
  createContext,
  useContext,
  useRef,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";

import { WebSocketClient } from "@/services/websocket/WebSocketClient";
import { deviceService } from "@/services/local/device.local.service";
import { queueTokenLocal } from "@/services/local/queue-token.local.service";
import { useAppState } from "@/ui/hooks/useAppState";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";

interface QueueWebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  client: WebSocketClient | null;
  connect: (wsUrl: string) => Promise<void>;
  disconnect: () => void;
}

const QueueWebSocketContext =
  createContext<QueueWebSocketContextType | undefined>(undefined);

export const QueueWebSocketProvider = ({ children }: { children: ReactNode }) => {
  const { state, loading } = useAppState();
  const location = useLocation();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [client, setClient] = useState<WebSocketClient | null>(null);

  const clientRef = useRef<WebSocketClient | null>(null);
  const hasAutoConnected = useRef(false);

  /* =========================
     MANUAL CONNECT
  ========================= */
  const connect = useCallback(async (wsUrl: string) => {
    if (state?.device_role !== "QUEUE") return;

    const device = await deviceService.getDevice();
    if (!device) {
      setError("Device not found");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      clientRef.current?.disconnect();

      // Use unique ID (device.id + role) to support multiple apps on same device
      const uniqueDeviceId = `${device.id}_QUEUE`;
      const wsClient = new WebSocketClient(wsUrl, uniqueDeviceId, "QUEUE");

      await wsClient.connect();
      await wsClient.waitForRegisterAck();

      clientRef.current = wsClient;
      setClient(wsClient);
      setIsConnected(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Connection failed");
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  }, [state]);

  /* =========================
     MANUAL DISCONNECT
  ========================= */
  const disconnect = useCallback(() => {
    clientRef.current?.disconnect();
    clientRef.current = null;

    setClient(null);
    setIsConnected(false);
    setIsConnecting(false);
    setError(null);
  }, []);

  /* =========================
     AUTO CONNECT (NOT on communication page)
  ========================= */
  useEffect(() => {
    if (
      loading ||
      !state ||
      hasAutoConnected.current ||
      state.device_role !== "QUEUE" ||
      location.pathname.includes("/queue/communication")
    ) {
      return;
    }

    if (state.ws_server_url && !isConnected && !isConnecting) {
      hasAutoConnected.current = true;
      connect(state.ws_server_url);
    }
  }, [loading, state, location.pathname, isConnected, isConnecting, connect]);

  /* =========================
     WS MESSAGE HANDLERS (QUEUE)
  ========================= */
  useEffect(() => {
    if (!client || !isConnected) return;

    // POS → Queue : new order
    const onNewTicket = async (msg: any) => {
      const p = msg.payload;

      await queueTokenLocal.saveToken({
        id: crypto.randomUUID(),
        ticket_id: p.ticket_id,
        ticket_number: String(p.ticket_number),
        token_number: p.token_number,
        status: "WAITING",
        source: "POS",
        location_id: p.location_id,
        order_mode: p.order_mode,
        created_at: p.created_at ?? new Date().toISOString(),
      });

      localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
        reason: "new_ticket",
      });
    };

    // POS → Queue : call token
    const onQueueCall = async (msg: any) => {
      const token = msg.payload?.token_number;
      if (!token) return;

      await queueTokenLocal.updateStatus(token, "CALLED");

      localEventBus.emit(LocalEventTypes.QUEUE_TOKEN_CALLED, {
        tokenNumber: token,
      });

      localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
        reason: "queue_call",
      });
    };

    // POS → Queue : served
    const onQueueServed = async (msg: any) => {
      const token = msg.payload?.token_number;
      if (!token) return;

      await queueTokenLocal.updateStatus(token, "SERVED");

      localEventBus.emit(LocalEventTypes.QUEUE_TOKEN_SERVED, {
        tokenNumber: token,
      });

      localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
        reason: "queue_served",
      });
    };

    client.on("new_ticket", onNewTicket);
    client.on("queue_call", onQueueCall);
    client.on("queue_served", onQueueServed);

    return () => {
      client.off("new_ticket", onNewTicket);
      client.off("queue_call", onQueueCall);
      client.off("queue_served", onQueueServed);
    };
  }, [client, isConnected]);

  return (
    <QueueWebSocketContext.Provider
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
    </QueueWebSocketContext.Provider>
  );
};

// Hook
export const useQueueWebSocket = () => {
  const ctx = useContext(QueueWebSocketContext);
  if (!ctx) {
    throw new Error(
      "useQueueWebSocket must be used within QueueWebSocketProvider"
    );
  }
  return ctx;
};
