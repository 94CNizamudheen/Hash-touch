use crate::websocket::{broadcast_to_device_type, DeviceMessage};
use crate::WsState;
use tauri::{command, State};

#[command]
pub async fn broadcast_to_kds(
    ws_state: State<'_, WsState>,
    message: DeviceMessage,
) -> Result<(), String> {
    let devices = ws_state.server.get_devices();

    let count = devices.read().await.len();
    if count == 0 {
        log::warn!("⚠️ No connected KDS devices");
    }

    broadcast_to_device_type(&devices, "KDS", &message)
        .await
        .map_err(|e| format!("Failed to broadcast to KDS: {}", e))
}

#[command]
pub async fn broadcast_to_queue(
    ws_state: State<'_, WsState>,
    message: DeviceMessage,
) -> Result<(), String> {
    let devices = ws_state.server.get_devices();

    let count = devices.read().await.len();
    if count == 0 {
        log::warn!("⚠️ No connected QUEUE devices");
    }

    broadcast_to_device_type(&devices, "QUEUE", &message)
        .await
        .map_err(|e| format!("Failed to broadcast to QUEUE: {}", e))
}

#[command]
pub async fn broadcast_to_pos(
    ws_state: State<'_, WsState>,
    message: DeviceMessage,
) -> Result<(), String> {
    let devices = ws_state.server.get_devices();

    let count = devices.read().await.len();
    if count == 0 {
        log::warn!("⚠️ No connected POS devices");
    }

    broadcast_to_device_type(&devices, "POS", &message)
        .await
        .map_err(|e| format!("Failed to broadcast to POS: {}", e))
}

#[command]
pub async fn broadcast_order(
    ws_state: State<'_, WsState>,
    order_data: serde_json::Value,
) -> Result<(), String> {
    let devices = ws_state.server.get_devices();

    // 🧑‍🍳 KDS
    let kds_message = DeviceMessage {
        message_type: "new_order".to_string(),
        device_id: None,
        device_type: "SERVER".to_string(),
        payload: order_data.clone(), 
    };

    broadcast_to_device_type(&devices, "KDS", &kds_message)
        .await
        .map_err(|e| format!("Failed to broadcast to KDS: {}", e))?;

    // 📺 QUEUE
    let queue_message = DeviceMessage {
        message_type: "new_ticket".to_string(),
        device_id: None,
        device_type: "SERVER".to_string(),
        payload: order_data, 
    };

    broadcast_to_device_type(&devices, "QUEUE", &queue_message)
        .await
        .map_err(|e| format!("Failed to broadcast to QUEUE: {}", e))?;

    Ok(())
}
