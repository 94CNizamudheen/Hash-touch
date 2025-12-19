
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductTag {
    pub id: String,

    pub tag_group_id: String,
    pub product_id: String,

    pub name: String,
    pub price: f64,

    pub active: i32,
    pub sort_order: i32,

    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub deleted_at: Option<String>,
}
