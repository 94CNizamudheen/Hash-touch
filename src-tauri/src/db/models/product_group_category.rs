use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductGroupCategory {
    pub id: String,

    pub product_group_id: String,

    pub name: String,
    pub code: Option<String>,

    pub active: i32,
    pub sort_order: i32,

    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub deleted_at: Option<String>,

    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub deleted_by: Option<String>,

    // JSON string
    pub media: Option<String>,
}
