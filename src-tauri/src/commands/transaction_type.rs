use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::transaction_type::TransactionType;
use crate::db::models::transaction_type_repo;

#[tauri::command]
pub fn save_transaction_types(app: AppHandle, items: Vec<TransactionType>) -> Result<(), String> {
    println!("🦀 Rust Command: save_transaction_types called with {} items", items.len());

    let mut conn = migrate::connection(&app);
    transaction_type_repo::save_transaction_types(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_transaction_types(app: AppHandle) -> Result<Vec<TransactionType>, String> {
    let conn = migrate::connection(&app);
    transaction_type_repo::get_transaction_types(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_transaction_types_cache(app: AppHandle) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    transaction_type_repo::clear_all(&mut conn)
        .map_err(|e| e.to_string())
}
