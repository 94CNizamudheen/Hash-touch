
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product::Product;
use crate::db::models::product_repo;

#[tauri::command]
pub fn save_products(app: AppHandle, items: Vec<Product>) -> Result<(), String> {
    println!("🦀 Rust Command: save_products called with {} items", items.len());

    // Debug: Check first few items for overrides
    let with_overrides: Vec<_> = items.iter()
        .filter(|p| p.overrides.is_some() && !p.overrides.as_ref().unwrap().is_empty() && p.overrides.as_ref().unwrap() != "[]")
        .take(3)
        .collect();

    if !with_overrides.is_empty() {
        println!("🦀 Rust Command: Found {} products with overrides", with_overrides.len());
        for product in with_overrides {
            println!("🦀 Rust Command: {} - overrides: {:?}", product.name, product.overrides);
        }
    } else {
        println!("🦀 Rust Command: ⚠️ NO PRODUCTS WITH OVERRIDES RECEIVED");
        // Sample first product to see what we got
        if let Some(first) = items.first() {
            println!("🦀 Rust Command: First product: name={}, overrides={:?}", first.name, first.overrides);
        }
    }

    let mut conn = migrate::connection(&app);
    product_repo::save_products(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_products(app: AppHandle) -> Result<Vec<Product>, String> {
    let conn = migrate::connection(&app);
    product_repo::get_products(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_products_cache(app: AppHandle) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_repo::clear_all(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_product_sold_out_status(app: AppHandle, product_id: String, is_sold_out: bool) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_repo::update_sold_out_status(&mut conn, &product_id, is_sold_out)
        .map_err(|e| e.to_string())
}
