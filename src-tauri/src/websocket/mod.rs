use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Arc;

use futures_util::{SinkExt, StreamExt};
use log::{error, info, warn};
use serde::{Deserialize, Serialize};
use tokio::net::{TcpListener, TcpStream};
use tokio::sync::{mpsc, RwLock};
use tokio_tungstenite::{accept_async, tungstenite::Message};

pub mod event_bus;
#[cfg(desktop)]
pub mod ws_routes;
/// ==============================
/// Device Message (shared payload)
/// ==============================
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DeviceMessage {
    pub message_type: String,
    pub device_id: Option<String>,
    pub device_type: String, // POS | KDS | QUEUE | PRINTER
    pub payload: serde_json::Value,
}

/// ==============================
/// Connected Device
/// ==============================
#[derive(Clone)]
pub struct ConnectedDevice {
    pub device_id: String,
    pub device_type: String,
    pub tx: mpsc::UnboundedSender<Message>,
}

/// Map of connected devices
pub type DeviceMap = Arc<RwLock<HashMap<String, ConnectedDevice>>>;

/// ==============================
/// WebSocket Server
/// ==============================
pub struct WebSocketServer {
    devices: DeviceMap,
    event_tx: mpsc::UnboundedSender<DeviceMessage>,
}

impl WebSocketServer {
    pub fn new(event_tx: mpsc::UnboundedSender<DeviceMessage>) -> Self {
        Self {
            devices: Arc::new(RwLock::new(HashMap::new())),
            event_tx,
        }
    }

    /// Start WebSocket server
    pub async fn start(&self, addr: &str) -> Result<(), Box<dyn std::error::Error>> {
        let listener = TcpListener::bind(addr).await?;
        info!("🚀 WebSocket server listening on {}", addr);

        loop {
            let (stream, addr) = listener.accept().await?;
            let devices = self.devices.clone();
            let event_tx = self.event_tx.clone();

            tokio::spawn(async move {
                if let Err(e) = handle_connection(stream, addr, devices, event_tx).await {
                    error!("❌ WebSocket error from {}: {}", addr, e);
                }
            });
        }
    }

    /// Get connected devices (read-only)
    pub fn get_devices(&self) -> DeviceMap {
        self.devices.clone()
    }
}

/// ==============================
/// Connection Handler
/// ==============================
async fn handle_connection(
    stream: TcpStream,
    addr: SocketAddr,
    devices: DeviceMap,
    event_tx: mpsc::UnboundedSender<DeviceMessage>,
) -> Result<(), Box<dyn std::error::Error>> {
    info!("📡 New WebSocket connection from {}", addr);

    let ws_stream = accept_async(stream).await?;
    let (mut ws_sender, mut ws_receiver) = ws_stream.split();

    let (tx, mut rx) = mpsc::unbounded_channel::<Message>();
    let mut device_id: Option<String> = None;

    // Outgoing messages → WebSocket
    let sender_task = tokio::spawn(async move {
        while let Some(msg) = rx.recv().await {
            if ws_sender.send(msg).await.is_err() {
                break;
            }
        }
    });

    // Incoming messages
    while let Some(msg) = ws_receiver.next().await {
        match msg {
            Ok(Message::Text(text)) => {
                match serde_json::from_str::<DeviceMessage>(&text) {
                    Ok(device_msg) => {
                        // 🔐 Registration
                        if device_msg.message_type == "register" {
                            let id = device_msg.device_id.clone().unwrap_or_else(|| {
                                format!("device_{}", chrono::Utc::now().timestamp())
                            });

                            let device = ConnectedDevice {
                                device_id: id.clone(),
                                device_type: device_msg.device_type.clone(),
                                tx: tx.clone(),
                            };

                            devices.write().await.insert(id.clone(), device);
                            device_id = Some(id.clone());

                            info!("✅ Registered device {} ({})", id, device_msg.device_type);

                            // Acknowledge registration
                            let ack = DeviceMessage {
                                message_type: "register_ack".into(),
                                device_id: Some(id),
                                device_type: "SERVER".into(),
                                payload: serde_json::json!({ "status": "connected" }),
                            };

                            let _ = tx.send(Message::Text(serde_json::to_string(&ack)?.into()));
                        } else {
                            // 📤 Forward event to EventBus
                            if let Err(e) = event_tx.send(device_msg) {
                                error!("❌ Failed to forward event: {}", e);
                            }
                        }
                    }
                    Err(e) => warn!("⚠️ Invalid message from {}: {}", addr, e),
                }
            }

            Ok(Message::Close(_)) => {
                info!("🔌 Client disconnected {}", addr);
                break;
            }

            Err(e) => {
                error!("❌ WebSocket receive error {}: {}", addr, e);
                break;
            }

            _ => {}
        }
    }

    // Cleanup
    if let Some(id) = device_id {
        devices.write().await.remove(&id);
        info!("🗑️ Removed device {}", id);
    }

    sender_task.abort();
    Ok(())
}

/// ==============================
/// Helper: Broadcast by device type
/// ==============================
#[allow(dead_code)]
pub async fn broadcast_to_device_type(
    devices: &DeviceMap,
    device_type: &str,
    message: &DeviceMessage,
) -> Result<(), Box<dyn std::error::Error>> {
    let devices = devices.read().await;
    let text = serde_json::to_string(message)?;

    for device in devices.values() {
        if device.device_type == device_type {
            let _ = device.tx.send(Message::Text(text.clone().into()));
        }
    }

    Ok(())
}

/// ==============================
/// Helper: Send to single device
/// ==============================
#[allow(dead_code)]
pub async fn send_to_device(
    devices: &DeviceMap,
    device_id: &str,
    message: &DeviceMessage,
) -> Result<(), Box<dyn std::error::Error>> {
    let devices = devices.read().await;

    if let Some(device) = devices.get(device_id) {
        let text = serde_json::to_string(message)?;
        device.tx.send(Message::Text(text.into()))?;
        Ok(())
    } else {
        Err(format!("Device not found: {}", device_id).into())
    }
}


