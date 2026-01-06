// src/ui/context/QueueWebSocketContext.tsx
import {
    createContext,
    useContext,
    useEffect,
    useRef,
    useState,
    useCallback,
    type ReactNode,
} from "react";

import { WebSocketClient } from "@/services/websocket/WebSocketClient";
import { websocketService } from "@/services/websocket/websocket.service";
import { deviceService } from "@/services/local/device.local.service";
import { useAppState } from "@/ui/hooks/useAppState";
import { queueTokenLocal } from "@/services/local/queue-token.local.service";
import { localEventBus, LocalEventTypes } from "@/services/eventbus/LocalEventBus";
// import { peripheralService } from "@/services/peripheral/peripheral.service";

interface QueueWebSocketContextType {
    isConnected: boolean;
    isConnecting: boolean;
    error: string | null;
    client: WebSocketClient | null;
    connect: (wsUrl: string, deviceRole: string) => Promise<void>;
    disconnect: () => void;
}

const QueueWebSocketContext =
    createContext<QueueWebSocketContextType | undefined>(undefined);

export const QueueWebSocketProvider = ({
    children,
}: {
    children: ReactNode;
}) => {
    const { state, loading } = useAppState();

    const [isConnected, setIsConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [client, setClient] = useState<WebSocketClient | null>(null);

    const clientRef = useRef<WebSocketClient | null>(null);
    const hasAttemptedAutoConnect = useRef(false);

    /* -------------------------------- connect -------------------------------- */

    const connect = useCallback(async (wsUrl: string, deviceRole: string) => {
        if (deviceRole !== "QUEUE") return;

        const device = await deviceService.getDevice();
        if (!device) {
            setError("Device not found");
            return;
        }

        setIsConnecting(true);
        setError(null);

        try {
            if (clientRef.current) {
                clientRef.current.disconnect();
            }

            const wsClient = new WebSocketClient(wsUrl, device.id, "QUEUE");

            await wsClient.connect();
            await wsClient.waitForRegisterAck();

            websocketService.setClient(wsClient);
            clientRef.current = wsClient;
            setClient(wsClient);

            setIsConnected(true);
            setIsConnecting(false);
        } catch (err) {
            setIsConnected(false);
            setIsConnecting(false);
            setError(err instanceof Error ? err.message : "Connection failed");
        }
    }, []);

    /* ------------------------------- disconnect ------------------------------- */

    const disconnect = useCallback(() => {
        clientRef.current?.disconnect();
        websocketService.setClient(null as any);
        clientRef.current = null;

        setClient(null);
        setIsConnected(false);
        setIsConnecting(false);
        setError(null);
    }, []);

    /* ----------------------------- auto connect ----------------------------- */

    useEffect(() => {
        if (loading || !state || hasAttemptedAutoConnect.current) return;
        if (state.device_role !== "QUEUE") return;


        if (state.ws_server_url && !isConnected && !isConnecting) {
            hasAttemptedAutoConnect.current = true;
        }
    }, [loading, state, isConnected, isConnecting]);

    useEffect(() => {
        if (hasAttemptedAutoConnect.current && !isConnected && !isConnecting) {
            setTimeout(()=>{
                connect(state!.ws_server_url, "QUEUE");
            },0)
            
        }
    }, [isConnected, isConnecting, connect, state]);

    /* ----------------------- WebSocket message listeners ---------------------- */

    useEffect(() => {
        if (!client || !isConnected || state?.device_role !== "QUEUE") return;

        /* ---- POS → order created ---- */
        const onOrderCreated = async (msg: any) => {
            const p = msg.payload;

            await queueTokenLocal.saveToken({
                id: crypto.randomUUID(),
                ticketId: p.ticket_id,
                ticketNumber: String(p.ticket_number),
                tokenNumber: p.token_number,
                status: "WAITING",
                source: "POS",
                locationId: p.location_id,
                orderMode: p.order_mode,
                createdAt: p.created_at ?? new Date().toISOString(),
            });

            localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
                reason: "order_created",
                tokenNumber: p.token_number,
            });

        };

        /* ---- POS → token called ---- */
        const onTokenCalled = async (msg: any) => {
            const token = msg.payload.token_number;

            await queueTokenLocal.updateStatus(token, "CALLED");

            //   await peripheralService.playQueueVoice(
            //     `Token number ${token}, please proceed to the counter`
            //   );

            localEventBus.emit(LocalEventTypes.QUEUE_TOKEN_CALLED, {
                tokenNumber: token,
            });
            localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
                reason: "token_called",
            });

        };

        /* ---- POS / KDS → token served ---- */
        const onTokenServed = async (msg: any) => {
            await queueTokenLocal.updateStatus(
                msg.payload.token_number,
                "SERVED"
            );

            localEventBus.emit(LocalEventTypes.QUEUE_TOKEN_SERVED, {
                tokenNumber: msg.payload.token_number,
            });

            localEventBus.emit(LocalEventTypes.QUEUE_UPDATED, {
                reason: "token_served",
            });
        };

        client.on("order_created", onOrderCreated);
        client.on("token_called", onTokenCalled);
        client.on("token_served", onTokenServed);

        return () => {
            client.off("order_created", onOrderCreated);
            client.off("token_called", onTokenCalled);
            client.off("token_served", onTokenServed);
        };
    }, [client, isConnected, state]);

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

/* --------------------------------- hook --------------------------------- */

// eslint-disable-next-line react-refresh/only-export-components
export const useQueueWebSocket = () => {
    const ctx = useContext(QueueWebSocketContext);
    if (!ctx) {
        throw new Error(
            "useQueueWebSocket must be used within QueueWebSocketProvider"
        );
    }
    return ctx;
};
