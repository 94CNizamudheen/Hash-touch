#![allow(dead_code)]

use super::DeviceMessage;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::{mpsc, RwLock};
use log::{info, error};

/// Event handler function type
pub type EventHandler = Arc<dyn Fn(&DeviceMessage) + Send + Sync>;

/// ==============================
/// Global Event Bus (WebSocket → App)
/// ==============================
#[derive(Clone)]
pub struct EventBus {
    handlers: Arc<RwLock<HashMap<String, Vec<EventHandler>>>>,
    rx: Arc<RwLock<mpsc::UnboundedReceiver<DeviceMessage>>>,
}

impl EventBus {
    /// Create a new EventBus
    pub fn new(rx: mpsc::UnboundedReceiver<DeviceMessage>) -> Self {
        Self {
            handlers: Arc::new(RwLock::new(HashMap::new())),
            rx: Arc::new(RwLock::new(rx)),
        }
    }

    /// Subscribe to a specific event type
    /// Use "*" to subscribe to all events
    pub async fn subscribe<F>(&self, event_type: &str, handler: F)
    where
        F: Fn(&DeviceMessage) + Send + Sync + 'static,
    {
        let mut handlers = self.handlers.write().await;

        handlers
            .entry(event_type.to_string())
            .or_insert_with(Vec::new)
            .push(Arc::new(handler));

        info!("📬 EventBus subscribed to event: {}", event_type);
    }

    /// Start listening for incoming events
    /// This should be run inside an async task
    pub async fn start(&self) {
        info!("🚀 EventBus started");

        loop {
            let message = {
                let mut rx = self.rx.write().await;
                rx.recv().await
            };

            match message {
                Some(msg) => self.dispatch(&msg).await,
                None => {
                    error!("❌ EventBus channel closed");
                    break;
                }
            }
        }
    }

    /// Dispatch event to subscribers
    async fn dispatch(&self, message: &DeviceMessage) {
        let handlers = self.handlers.read().await;

        // Exact event match
        if let Some(event_handlers) = handlers.get(&message.message_type) {
            for handler in event_handlers {
                handler(message);
            }
        }

        // Wildcard listeners
        if let Some(wildcard_handlers) = handlers.get("*") {
            for handler in wildcard_handlers {
                handler(message);
            }
        }
    }
}


/// Local Event Bus (In-App only)

#[derive(Clone, Default)]
pub struct LocalEventBus {
    handlers: Arc<RwLock<HashMap<String, Vec<EventHandler>>>>,
}

impl LocalEventBus {
    /// Create a new LocalEventBus
    pub fn new() -> Self {
        Self {
            handlers: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    /// Subscribe to a local event
    pub async fn subscribe<F>(&self, event_type: &str, handler: F)
    where
        F: Fn(&DeviceMessage) + Send + Sync + 'static,
    {
        let mut handlers = self.handlers.write().await;

        handlers
            .entry(event_type.to_string())
            .or_insert_with(Vec::new)
            .push(Arc::new(handler));

        info!("📬 LocalEventBus subscribed to event: {}", event_type);
    }

    /// Emit a local event
    pub async fn emit(&self, message: &DeviceMessage) {
        let handlers = self.handlers.read().await;

        // Exact event match
        if let Some(event_handlers) = handlers.get(&message.message_type) {
            for handler in event_handlers {
                handler(message);
            }
        }

        // Wildcard listeners
        if let Some(wildcard_handlers) = handlers.get("*") {
            for handler in wildcard_handlers {
                handler(message);
            }
        }
    }
}
