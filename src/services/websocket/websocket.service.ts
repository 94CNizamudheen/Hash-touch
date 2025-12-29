import { invoke } from "@tauri-apps/api/core";
import { WebSocketClient, type DeviceMessage } from "./WebSocketClient";

class WebSocketService {
  private client: WebSocketClient | null = null;

  setClient(client: WebSocketClient) {
    this.client = client;
  }

  getClient(): WebSocketClient | null {
    return this.client;
  }

  isConnected(): boolean {
    return this.client?.isConnected() ?? false;
  }

  sendMessage(message: DeviceMessage): void {
    if (!this.client) {
      console.warn("⚠️ WebSocket client not initialized");
      return;
    }
    this.client.send(message);
  }

  // Broadcast order to both KDS and Queue via Tauri backend
  async broadcastOrder(orderData: any): Promise<void> {
    if (!this.isConnected()) {
      console.warn("⚠️ WebSocket not connected, cannot broadcast order");
      return;
    }

    try {
      await invoke("broadcast_order", { orderData });
      console.log("📡 Order broadcasted to KDS and Queue displays via backend");
    } catch (error) {
      console.error("❌ Failed to broadcast order:", error);
      throw error;
    }
  }

  // Send to KDS only
  async broadcastToKDS(message: DeviceMessage): Promise<void> {
    try {
      await invoke("broadcast_to_kds", { message });
      console.log("📤 Message sent to KDS devices");
    } catch (error) {
      console.error("❌ Failed to broadcast to KDS:", error);
      throw error;
    }
  }

  // Send to Queue only
  async broadcastToQueue(message: DeviceMessage): Promise<void> {
    try {
      await invoke("broadcast_to_queue", { message });
      console.log("📤 Message sent to Queue displays");
    } catch (error) {
      console.error("❌ Failed to broadcast to Queue:", error);
      throw error;
    }
  }
}

export const websocketService = new WebSocketService();
