
use tauri::AppHandle;
use crate::db::{migrate, models::location::*};
#[tauri::command]
pub fn save_locations(app: AppHandle, locations: Vec<Location>) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    upsert(&mut conn, &locations).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn select_location(app: AppHandle, server_id: String) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    select(&mut conn, &server_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_locations(app: AppHandle) -> Result<Vec<Location>, String> {
    let conn = migrate::connection(&app);
    list_active(&conn).map_err(|e| e.to_string())
}
