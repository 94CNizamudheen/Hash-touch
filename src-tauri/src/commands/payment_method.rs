use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::payment_method::PaymentMethod;
use crate::db::models::payment_method_repo;

#[tauri::command]
pub fn save_payment_methods(app: AppHandle, items: Vec<PaymentMethod>) -> Result<(), String> {
    println!("🦀 Rust Command: save_payment_methods called with {} items", items.len());

    let mut conn = migrate::connection(&app);
    payment_method_repo::save_payment_methods(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_payment_methods(app: AppHandle) -> Result<Vec<PaymentMethod>, String> {
    let conn = migrate::connection(&app);
    payment_method_repo::get_payment_methods(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_payment_methods_cache(app: AppHandle) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    payment_method_repo::clear_all(&mut conn)
        .map_err(|e| e.to_string())
}
