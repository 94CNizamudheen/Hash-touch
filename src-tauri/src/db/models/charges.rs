use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Charge {
    pub id: String,
    pub code: Option<String>,
    pub name: String,
    pub percentage: Option<String>,
    pub is_tax: i32,
    pub transaction_type_id: Option<String>,
    pub parent_charge_id: Option<String>,
    pub active: i32,
    pub sort_order: i32,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub deleted_at: Option<String>,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub deleted_by: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ChargeMapping {
    pub id: String,
    pub charge_id: String,
    pub category_id: Option<String>,
    pub product_id: Option<String>,
    pub product_group_id: Option<String>,
    pub active: i32,
    pub sort_order: i32,
    pub created_at: Option<String>,
    pub updated_at: Option<String>,
    pub deleted_at: Option<String>,
    pub created_by: Option<String>,
    pub updated_by: Option<String>,
    pub deleted_by: Option<String>,
}
