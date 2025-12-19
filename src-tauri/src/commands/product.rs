
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product::Product;
use crate::db::models::product_repo;

#[tauri::command]
pub fn save_products(app: AppHandle, items: Vec<Product>) -> Result<(), String> {
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
