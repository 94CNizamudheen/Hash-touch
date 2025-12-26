use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::charges::{Charge, ChargeMapping};
use crate::db::models::charges_repo;

#[tauri::command]
pub fn save_charges(app: AppHandle, items: Vec<Charge>) -> Result<(), String> {
    println!("🦀 Rust Command: save_charges called with {} items", items.len());

    let mut conn = migrate::connection(&app);
    charges_repo::save_charges(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_charge_mappings(app: AppHandle, items: Vec<ChargeMapping>) -> Result<(), String> {
    println!("🦀 Rust Command: save_charge_mappings called with {} items", items.len());

    let mut conn = migrate::connection(&app);
    charges_repo::save_charge_mappings(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_charges(app: AppHandle) -> Result<Vec<Charge>, String> {
    let conn = migrate::connection(&app);
    charges_repo::get_charges(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_charge_mappings(app: AppHandle) -> Result<Vec<ChargeMapping>, String> {
    let conn = migrate::connection(&app);
    charges_repo::get_charge_mappings(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_charges_cache(app: AppHandle) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    charges_repo::clear_all(&mut conn)
        .map_err(|e| e.to_string())
}
