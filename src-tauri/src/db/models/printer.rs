use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Printer {
    pub id: String,
    pub name: String,
    pub printer_type: String, // "network", "usb", "bluetooth"
    pub ip_address: Option<String>,
    pub port: Option<i32>,
    pub is_active: bool,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
