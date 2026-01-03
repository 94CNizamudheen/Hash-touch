use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Workday {
    pub id: Option<i64>,
    pub workday_id: Option<String>,
    pub start_user: Option<String>,
    pub end_user: Option<String>,
    pub start_time: Option<String>,
    pub end_time: Option<String>,
    pub location_id: String,
    pub total_sales: Option<f64>,
    pub total_taxes: Option<f64>,
    pub total_ticket_count: Option<i32>,
    pub work_period_informations: Option<String>,
    pub department_ticket_informations: Option<String>,
    pub add_on: Option<String>,
    pub auto_closed: Option<bool>,
    pub external_processed: Option<bool>,
    pub work_period_day: Option<String>,
    pub business_date: Option<String>,
    pub sync_status: String, // PENDING, SYNCING, SYNCED, FAILED
    pub sync_error: Option<String>,
    pub created_at: String,
    pub updated_at: Option<String>,
}
