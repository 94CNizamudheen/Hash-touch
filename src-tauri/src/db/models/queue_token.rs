

use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct QueueToken {
    pub id: String,
    pub ticket_id: String,
    pub ticket_number: String,
    pub token_number: i32,
    pub status: String, // WAITING | CALLED | SERVED
    pub source: Option<String>,
    pub location_id: Option<String>,
    pub order_mode: Option<String>,
    pub created_at: String,
    pub called_at: Option<String>,
    pub served_at: Option<String>,
}
