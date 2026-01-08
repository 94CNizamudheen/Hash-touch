use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Setup {
    pub id: String,
    pub code: String,
    pub name: Option<String>,
    pub setup_type: Option<String>,
    pub channel: Option<String>,
    pub settings: Option<String>,
    pub country_code: Option<String>,
    pub currency_code: Option<String>,
    pub currency_symbol: Option<String>,
    pub active: Option<i32>,
    pub sort_order: Option<i32>,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
}
