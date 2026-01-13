

#[derive(Debug, serde::Serialize)]
pub struct AppState {
    pub tenant_domain: Option<String>,
    pub access_token: Option<String>,
    pub selected_location_id: Option<String>,
    pub selected_location_name: Option<String>,
    pub brand_id: Option<String>,
    pub order_mode_ids: Option<Vec<String>>,
    pub order_mode_names: Option<Vec<String>>,
    pub selected_order_mode_id: Option<String>,
    pub selected_order_mode_name: Option<String>,
    pub device_role: Option<String>,
    pub sync_status: Option<String>,
    pub theme: Option<String>,
    pub language: Option<String>,
    pub kds_view_mode: Option<String>,
    pub kds_settings: Option<String>,
    pub ws_server_mode: Option<i32>,
    pub ws_server_url: Option<String>,
    pub setup_code: Option<String>,
    pub logo_url: Option<String>,
}
