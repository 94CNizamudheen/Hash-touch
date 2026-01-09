use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct ProductTagGroupMapping {
    pub product_id: String,
    pub tag_group_id: String,
}
