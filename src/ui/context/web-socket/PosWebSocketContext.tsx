import {
    createContext,
    useContext,
    useRef,
    useState,
    useCallback,
    useEffect,
    type ReactNode,
} from "react";

import { WebSocketClient } from "@/services/websocket/WebSocketClient";
import { deviceService } from "@/services/local/device.local.service";
import { ticketLocal } from "@/services/local/ticket.local.service";
import { useAppState } from "@/ui/hooks/useAppState";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
import { websocketService } from "@/services/websocket/websocket.service";

interface PosWebSocketContextType {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    client: WebSocketClient | null;
    connect: (wsUrl: string) => Promise<void>;
    disconnect: () => void;
}

const PosWebSocketContext =
    createContext<PosWebSocketContextType | undefined>(undefined);

export const PosWebSocketProvider = ({ children }: { children: ReactNode }) => {
    const { state } = useAppState();

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [client, setClient] = useState<WebSocketClient | null>(null);

    const clientRef = useRef<WebSocketClient | null>(null);

    /* =========================
       CONNECT (POS is server)
    ========================= */
    const connect = useCallback(async (wsUrl: string) => {
        if (state?.device_role !== "POS") return;

        const device = await deviceService.getDevice();
        if (!device) {
            setError("Device not found");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            clientRef.current?.disconnect();

            const wsClient = new WebSocketClient(wsUrl, device.id, "POS");

            await wsClient.connect();
            await wsClient.waitForRegisterAck();
            websocketService.setClient(wsClient);

            clientRef.current = wsClient;
            setClient(wsClient);
            setIsConnected(true);

            console.log("✅ [POS] WebSocket connected");
        } catch (err) {
            setError(err instanceof Error ? err.message : "Connection failed");
            setIsConnected(false);
        } finally {
            setIsConnecting(false);
        }
    }, [state]);

    useEffect(() => {
        if (!state || state.device_role !== "POS") return;
        if (!state.ws_server_url) return;
        if (isConnected || isConnecting) return;

        console.log("🔍 [POS] Auto-connecting to WS:", state.ws_server_url);

        connect(state.ws_server_url);
    }, [state, isConnected, isConnecting, connect]);

    /* =========================
       DISCONNECT
    ========================= */
    const disconnect = useCallback(() => {
        clientRef.current?.disconnect();
        clientRef.current = null;

        setClient(null);
        setIsConnected(false);
        setIsConnecting(false);
        setError(null);

        console.log("🔌 [POS] WebSocket disconnected");
    }, []);

    /* =========================
       WS MESSAGE HANDLERS (POS)
    ========================= */
    useEffect(() => {
        if (!client || !isConnected || state?.device_role !== "POS") return;

        /**
         * KDS → POS: Order is READY (food prepared)
         * Then POS → QUEUE: Call token
         */
        const onOrderReadyFromKds = async (msg: any) => {
            const p = msg.payload;

            console.log("🍳 [POS] Received order_ready from KDS:", p);

            // Validate payload
            if (!p?.order_id || !p?.token_number) {
                console.error("[POS] ❌ Invalid order_ready payload:", p);
                return;
            }

            try {
                // 1. Update local database
                await ticketLocal.updateOrderStatus(p.order_id, "READY");
                console.log(`[POS] ✅ Local ticket ${p.ticket_number} marked READY`);

                // 2. Emit local event for UI update
                localEventBus.emit(LocalEventTypes.TICKET_CREATED, {
                    ticketId: p.order_id,
                    status: "READY",
                });

                // 3. Send queue_call to QUEUE displays
                await websocketService.broadcastToQueue({
                    message_type: "queue_call",
                    device_type: "POS",
                    payload: {
                        ticket_id: p.ticket_id,
                        ticket_number: p.ticket_number,
                        token_number: p.token_number,
                        status: "CALLED",
                        timestamp: new Date().toISOString(),
                    },
                });

                console.log(`[POS] 📣 queue_call sent to QUEUE for token ${p.token_number}`);

            } catch (error) {
                console.error("[POS] ❌ Failed to process order_ready:", error);
            }
        };

        // Register the handler
        console.log("[POS] 📡 Registering order_ready listener");
        client.on("order_ready", onOrderReadyFromKds);

        // Cleanup
        return () => {
            console.log("[POS] 🔌 Removing order_ready listener");
            client.off("order_ready", onOrderReadyFromKds);
        };
    }, [client, isConnected, state]);

    return (
        <PosWebSocketContext.Provider
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
        </PosWebSocketContext.Provider>
    );
};

// Hook
// eslint-disable-next-line react-refresh/only-export-components
export const usePosWebSocket = () => {
    const ctx = useContext(PosWebSocketContext);
    if (!ctx) {
        throw new Error(
            "usePosWebSocket must be used within PosWebSocketProvider"
        );
    }
    return ctx;
};