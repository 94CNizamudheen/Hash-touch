import { type DeviceMessage } from "../websocket/WebSocketClient";

export type EventHandler = (message: DeviceMessage) => void;

class EventBus {
  private handlers: Map<string, EventHandler[]> = new Map();

  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler);
  }

  unsubscribe(eventType: string, handler: EventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(message: DeviceMessage): void {
    // Emit to specific handlers
    const handlers = this.handlers.get(message.message_type);
    if (handlers) {
      handlers.forEach((handler) => handler(message));
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(message));
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Global EventBus instance
export const eventBus = new EventBus();
