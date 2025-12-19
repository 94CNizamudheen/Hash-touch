
use serde::{Serialize};

#[derive(Debug, Serialize)]
pub struct ProductWithCombinations {
    pub id: String,
    pub name: String,
    pub price: f64,
    pub description: Option<String>,
    pub media: Option<String>,

    pub combinations: Vec<TagGroupWithTags>,
}

#[derive(Debug, Serialize)]
pub struct TagGroupWithTags {
    pub id: String,
    pub name: String,
    pub min_items: i32,
    pub max_items: i32,

    pub options: Vec<ProductTagOption>,
}

#[derive(Debug, Serialize)]
pub struct ProductTagOption {
    pub id: String,
    pub product_id: String,
    pub name: String,
    pub price: f64,
}
