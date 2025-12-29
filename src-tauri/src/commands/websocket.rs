use crate::websocket::{broadcast_to_device_type, DeviceMessage};
use crate::WsState;
use tauri::{command, State};

#[command]
pub async fn broadcast_to_kds(
    ws_state: State<'_, WsState>,
    message: DeviceMessage,
) -> Result<(), String> {
    broadcast_to_device_type(&ws_state.server.get_devices(), "KDS", &message)
        .await
        .map_err(|e| format!("Failed to broadcast to KDS: {}", e))
}

#[command]
pub async fn broadcast_to_queue(
    ws_state: State<'_, WsState>,
    message: DeviceMessage,
) -> Result<(), String> {
    broadcast_to_device_type(&ws_state.server.get_devices(), "QUEUE", &message)
        .await
        .map_err(|e| format!("Failed to broadcast to QUEUE: {}", e))
}

#[command]
pub async fn broadcast_order(
    ws_state: State<'_, WsState>,
    order_data: serde_json::Value,
) -> Result<(), String> {
    // Send to KDS devices
    let kds_message = DeviceMessage {
        message_type: "new_order".to_string(),
        device_id: None,
        device_type: "KDS".to_string(),
        payload: order_data.clone(),
    };

    broadcast_to_device_type(&ws_state.server.get_devices(), "KDS", &kds_message)
        .await
        .map_err(|e| format!("Failed to broadcast to KDS: {}", e))?;

    // Send to Queue displays
    let queue_message = DeviceMessage {
        message_type: "new_ticket".to_string(),
        device_id: None,
        device_type: "QUEUE".to_string(),
        payload: order_data,
    };

    broadcast_to_device_type(&ws_state.server.get_devices(), "QUEUE", &queue_message)
        .await
        .map_err(|e| format!("Failed to broadcast to QUEUE: {}", e))?;

    Ok(())
}
