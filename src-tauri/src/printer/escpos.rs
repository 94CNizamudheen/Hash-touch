use serde::{Deserialize, Serialize};

/// Printer configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PrinterConfig {
    pub id: String,
    pub name: String,
    pub printer_type: String, // "network", "usb", "bluetooth", "builtin"
    pub ip_address: Option<String>,
    pub port: Option<u16>,
    pub is_active: bool,
}
