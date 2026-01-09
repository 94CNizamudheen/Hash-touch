import { useState, useRef, useCallback } from "react";
import { WebSocketClient } from "@/services/websocket/WebSocketClient";
import { websocketService } from "@/services/websocket/websocket.service";
import { deviceService } from "@/services/local/device.local.service";

interface UseWebSocketConnectionProps {
  onConnected?: () => void;
  onDisconnected?: () => void;
  onError?: (error: Error) => void;
}

interface WebSocketConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
}

export function useWebSocketConnection({
  onConnected,
  onDisconnected,
  onError,
}: UseWebSocketConnectionProps = {}) {
  const [state, setState] = useState<WebSocketConnectionState>({
    isConnected: false,
    isConnecting: false,
    error: null,
  });

  const clientRef = useRef<WebSocketClient | null>(null);

  const connect = useCallback(async (wsUrl: string, deviceRole: string) => {
    // Skip for POS devices (they run as server)
    if (deviceRole === "POS") {
      console.log("[useWebSocketConnection] POS device - skipping client connection");
      return;
    }

    // Validate URL
    if (!wsUrl || wsUrl.trim() === "") {
      setState({
        isConnected: false,
        isConnecting: false,
        error: "WebSocket URL is required",
      });
      return;
    }

    // Get device info
    const device = await deviceService.getDevice();
    if (!device) {
      console.warn("[useWebSocketConnection] No device found");
      setState({
        isConnected: false,
        isConnecting: false,
        error: "Device not found",
      });
      return;
    }

    setState({ isConnected: false, isConnecting: true, error: null });

    try {
      console.log(`[useWebSocketConnection] Connecting ${deviceRole} to ${wsUrl}`);

      // Disconnect existing connection if any
      if (clientRef.current) {
        clientRef.current.disconnect();
        clientRef.current = null;
      }

      // Create WebSocket client with unique ID (device.id + role) to support multiple apps on same device
      const uniqueDeviceId = `${device.id}_${deviceRole}`;
      const client = new WebSocketClient(wsUrl, uniqueDeviceId, deviceRole);

      // Connect
      await client.connect();
      await client.waitForRegisterAck();

      // Store client in service
      websocketService.setClient(client);
      clientRef.current = client;

      console.log("✅ [useWebSocketConnection] WebSocket connected successfully");

      setState({
        isConnected: true,
        isConnecting: false,
        error: null,
      });

      onConnected?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      console.error("❌ [useWebSocketConnection] Connection failed:", errorMessage);

      setState({
        isConnected: false,
        isConnecting: false,
        error: errorMessage,
      });

      onError?.(error instanceof Error ? error : new Error(errorMessage));
    }
  }, [onConnected, onError]);

  const disconnect = useCallback(() => {
    if (clientRef.current) {
      console.log("[useWebSocketConnection] Disconnecting WebSocket");
      clientRef.current.disconnect();
      clientRef.current = null;
      websocketService.setClient(null as any);

      setState({
        isConnected: false,
        isConnecting: false,
        error: null,
      });

      onDisconnected?.();
    }
  }, [onDisconnected]);

  return {
    ...state,
    connect,
    disconnect,
  };
}
