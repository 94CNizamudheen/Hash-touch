use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Ticket {
    pub id: String,
    pub ticket_data: String, // JSON string of TicketRequest
    pub sync_status: String, // PENDING, SYNCING, SYNCED, FAILED
    pub sync_error: Option<String>,
    pub sync_attempts: i32,
    pub location_id: Option<String>,
    pub order_mode_name: Option<String>,
    pub ticket_amount: Option<i32>,
    pub items_count: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub synced_at: Option<String>,
}
