use crate::websocket::broadcast_to_device_type;
use crate::websocket::event_bus::EventBus; 
use crate::WsState;
use std::sync::Arc;

pub async fn register_ws_routes(event_bus: Arc<EventBus>, ws_state: Arc<WsState>) {
    log::info!("🔧 Registering WebSocket routes...");

    // KDS → POS: order_ready
    {
        let ws_state = ws_state.clone();
        event_bus.subscribe("order_ready", move |msg| {
            log::info!("📨 [Router] Received order_ready from KDS");
            let devices = ws_state.server.get_devices();

            let msg = msg.clone();
            tokio::spawn(async move {
                if let Err(e) = broadcast_to_device_type(&devices, "POS", &msg).await {
                    log::error!("❌ order_ready → POS failed: {}", e);
                } else {
                    log::info!("✅ order_ready routed to POS");
                }
            });
        }).await;
    }

    // POS → QUEUE: queue_call
    {
        let ws_state = ws_state.clone();
        event_bus.subscribe("queue_call", move |msg| {
            log::info!("📨 [Router] Received queue_call from POS");
            let devices = ws_state.server.get_devices();

            let msg = msg.clone();
            tokio::spawn(async move {
                if let Err(e) = broadcast_to_device_type(&devices, "QUEUE", &msg).await {
                    log::error!("❌ queue_call → QUEUE failed: {}", e);
                } else {
                    log::info!("✅ queue_call routed to QUEUE");
                }
            });
        }).await;
    }

    // POS → QUEUE: queue_served
    {
        let ws_state = ws_state.clone();
        event_bus.subscribe("queue_served", move |msg| {
            log::info!("📨 [Router] Received queue_served from POS");
            let devices = ws_state.server.get_devices();

            let msg = msg.clone();
            tokio::spawn(async move {
                if let Err(e) = broadcast_to_device_type(&devices, "QUEUE", &msg).await {
                    log::error!("❌ queue_served → QUEUE failed: {}", e);
                } else {
                    log::info!("✅ queue_served routed to QUEUE");
                }
            });
        }).await;
    }

    log::info!("✅ WebSocket routes registered successfully");
}