
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductTagGroup {
    pub id: String,

    pub product_id: String,

    pub name: String,

    pub min_items: i32,
    pub max_items: i32,

    pub active: i32,
    pub sort_order: i32,

    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub deleted_at: Option<String>,
}
