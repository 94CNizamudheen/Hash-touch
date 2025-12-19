
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct AppState {
    pub tenant_domain: Option<String>,
    pub access_token: Option<String>,
    pub selected_location_id: Option<String>,
    pub brand_id: Option<String>,
    pub order_mode_ids: Option<Vec<String>>,
    pub device_role: Option<String>,
    pub sync_status: Option<String>,
}