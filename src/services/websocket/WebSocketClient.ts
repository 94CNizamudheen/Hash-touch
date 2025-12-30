export interface DeviceMessage {
  message_type: string;
  device_id?: string;
  device_type: string; // "POS", "KDS", "QUEUE", "PRINTER"
  payload: any;
}

export type MessageHandler = (message: DeviceMessage) => void;

export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private deviceId: string;
  private deviceType: string;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 3000;
  private isIntentionallyClosed = false;

  constructor(url: string, deviceId: string, deviceType: string) {
    this.url = url;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[WebSocketClient] Attempting to connect to: ${this.url}`);
        this.ws = new WebSocket(this.url);
        this.isIntentionallyClosed = false;

        // Add connection timeout (10 seconds)
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket connection timeout");
            this.ws.close();
            reject(new Error("Connection timeout"));
          }
        }, 10000);

        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          console.log("✅ WebSocket connected successfully");
          this.reconnectAttempts = 0;

          // Register device
          this.send({
            message_type: "register",
            device_id: this.deviceId,
            device_type: this.deviceType,
            payload: {},
          });

          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: DeviceMessage = JSON.parse(event.data);
            console.log("📨 Received message:", message.message_type);
            this.handleMessage(message);
          } catch (error) {
            console.error("❌ Failed to parse message:", error);
          }
        };

        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          console.error("❌ WebSocket error:", error);
          console.error("❌ WebSocket URL:", this.url);
          console.error("❌ WebSocket readyState:", this.ws?.readyState);
          reject(error);
        };

        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.log("🔌 WebSocket disconnected", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean
          });

          if (!this.isIntentionallyClosed && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              console.log(`🔄 Attempting to reconnect (${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})...`);
              this.reconnectAttempts++;
              this.connect().catch(console.error);
            }, this.reconnectDelay);
          }
        };
      } catch (error) {
        console.error("❌ WebSocket connection error:", error);
        reject(error);
      }
    });
  }

  send(message: DeviceMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ WebSocket not connected, message not sent");
    }
  }

  on(messageType: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(messageType)) {
      this.messageHandlers.set(messageType, []);
    }
    this.messageHandlers.get(messageType)!.push(handler);
  }

  off(messageType: string, handler: MessageHandler): void {
    const handlers = this.messageHandlers.get(messageType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  private handleMessage(message: DeviceMessage): void {
    // Handle specific message type
    const handlers = this.messageHandlers.get(message.message_type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Handle wildcard handlers
    const wildcardHandlers = this.messageHandlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  disconnect(): void {
    this.isIntentionallyClosed = true;
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
