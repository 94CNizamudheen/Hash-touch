use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct KdsTicket {
    pub id: String,
    pub ticket_number: String,
    pub order_id: Option<String>,
    pub location_id: Option<String>,
    pub order_mode_name: Option<String>,
    pub status: String, // PENDING, IN_PROGRESS, READY
    pub items: String,  // JSON stringified array
    pub total_amount: Option<i32>,
    pub token_number: Option<i32>,
    pub created_at: String,
    pub updated_at: String,
}
