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

  // 🔐 Registration ACK handling
  private registerAckPromise: Promise<void> | null = null;
  private resolveRegisterAck: (() => void) | null = null;

  constructor(url: string, deviceId: string, deviceType: string) {
    this.url = url;
    this.deviceId = deviceId;
    this.deviceType = deviceType;
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        console.log(`[WebSocketClient] Connecting to ${this.url}`);

        // 🔐 Prepare register ACK promise
        this.registerAckPromise = new Promise((res) => {
          this.resolveRegisterAck = res;
        });

        this.ws = new WebSocket(this.url);
        this.isIntentionallyClosed = false;

        let hasResolved = false;

        // ⏱ Connection timeout
        const connectionTimeout = setTimeout(() => {
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.error("❌ WebSocket connection timeout");
            this.ws.close();
            if (!hasResolved) {
              hasResolved = true;
              reject(new Error("WebSocket connection timeout"));
            }
          }
        }, 3000);

        // ✅ Socket opened
        this.ws.onopen = () => {
          clearTimeout(connectionTimeout);
          hasResolved = true;

          console.log("✅ WebSocket connected");
          this.reconnectAttempts = 0;

          // 🔐 Register device with server
          this.send({
            message_type: "register",
            device_id: this.deviceId,
            device_type: this.deviceType,
            payload: {},
          });

          resolve();
        };

        // 📨 Incoming messages
        this.ws.onmessage = (event) => {
          try {
            const message: DeviceMessage = JSON.parse(event.data);
            console.log("📨 WS message:", message.message_type);

            // ✅ Register ACK
            if (message.message_type === "register_ack") {
              console.log("✅ Device successfully registered");
              this.resolveRegisterAck?.();
            }

            this.handleMessage(message);
          } catch (err) {
            console.error("❌ Invalid WS message:", err);
          }
        };

        // ❌ Error
        this.ws.onerror = (error) => {
          clearTimeout(connectionTimeout);
          if (!hasResolved) {
            hasResolved = true;
            console.error("❌ WebSocket error:", error);
            reject(error);
          }
        };

        // 🔌 Closed
        this.ws.onclose = (event) => {
          clearTimeout(connectionTimeout);
          console.warn("🔌 WebSocket closed", {
            code: event.code,
            reason: event.reason,
            clean: event.wasClean,
          });

          if (!hasResolved) {
            hasResolved = true;
            reject(
              new Error(
                `Closed before open: ${event.reason || "Unknown reason"}`
              )
            );
            return;
          }

          // 🔁 Auto reconnect
          if (
            !this.isIntentionallyClosed &&
            this.reconnectAttempts < this.maxReconnectAttempts
          ) {
            this.reconnectAttempts++;
            console.log(
              `🔄 Reconnecting (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
            );

            setTimeout(() => {
              this.connect().catch(console.error);
            }, this.reconnectDelay);
          }
        };
      } catch (err) {
        console.error("❌ WS setup error:", err);
        reject(err);
      }
    });
  }

  // 🔐 Wait until server confirms registration
  async waitForRegisterAck(): Promise<void> {
    if (this.registerAckPromise) {
      await this.registerAckPromise;
    }
  }

  send(message: DeviceMessage): void {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn("⚠️ WS not connected, message skipped");
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
    if (!handlers) return;

    const index = handlers.indexOf(handler);
    if (index >= 0) {
      handlers.splice(index, 1);
    }
  }

  private handleMessage(message: DeviceMessage): void {
    // Specific handlers
    const handlers = this.messageHandlers.get(message.message_type);
    if (handlers) {
      handlers.forEach((h) => h(message));
    }

    // Wildcard handlers
    const wildcard = this.messageHandlers.get("*");
    if (wildcard) {
      wildcard.forEach((h) => h(message));
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
