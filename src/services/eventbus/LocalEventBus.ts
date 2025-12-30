/**
 * LocalEventBus - For in-app events that don't go through WebSocket
 * Used for local communication between components
 */

export interface LocalEvent<T = any> {
  type: string;
  payload: T;
  timestamp?: number;
}

export type LocalEventHandler<T = any> = (event: LocalEvent<T>) => void;

class LocalEventBus {
  private handlers: Map<string, LocalEventHandler[]> = new Map();

  subscribe<T = any>(eventType: string, handler: LocalEventHandler<T>): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler as LocalEventHandler);

    // Return unsubscribe function
    return () => this.unsubscribe(eventType, handler);
  }

  unsubscribe(eventType: string, handler: LocalEventHandler): void {
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit<T = any>(eventType: string, payload: T): void {
    const event: LocalEvent<T> = {
      type: eventType,
      payload,
      timestamp: Date.now(),
    };

    // Emit to specific handlers
    const handlers = this.handlers.get(eventType);
    if (handlers) {
      handlers.forEach((handler) => handler(event));
    }

    // Emit to wildcard handlers
    const wildcardHandlers = this.handlers.get("*");
    if (wildcardHandlers) {
      wildcardHandlers.forEach((handler) => handler(event));
    }
  }

  clear(): void {
    this.handlers.clear();
  }
}

// Global LocalEventBus instance
export const localEventBus = new LocalEventBus();

// Common event types
export const LocalEventTypes = {
  PRINTER_STATUS_CHANGED: "printer:status_changed",
  TICKET_CREATED: "ticket:created",
  RECEIPT_PRINTED: "receipt:printed",
  DEVICE_CONNECTED: "device:connected",
  DEVICE_DISCONNECTED: "device:disconnected",
  // KDS Events
  KDS_TICKET_REMOVED: "kds:ticket_removed",
  KDS_STATUS_CHANGED: "kds:status_changed",
  KDS_TICKET_UPDATED: "kds:ticket_updated",
} as const;
