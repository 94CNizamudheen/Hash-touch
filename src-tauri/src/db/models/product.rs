
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Product {
    pub id: String,
    pub name: String,
    pub code: Option<String>,
    pub description: Option<String>,
    pub category_id: Option<String>,
    pub price: f64,
    pub active: bool,
    pub sort_order: i32,
    pub is_sold_out: Option<i32>,

    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub deleted_at: Option<String>,

    // store as JSON string
    pub media: Option<String>,
    pub overrides:Option<String>,
}
