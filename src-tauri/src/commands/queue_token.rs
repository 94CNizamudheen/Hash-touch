

use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::queue_token::QueueToken;
use crate::db::models::queue_token_repo;

#[tauri::command]
pub fn save_queue_token(app: AppHandle, token: QueueToken) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    queue_token_repo::save_queue_token(&mut conn, &token)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_queue_tokens(app: AppHandle) -> Result<Vec<QueueToken>, String> {
    let conn = migrate::connection(&app);
    queue_token_repo::get_active_queue_tokens(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_queue_token_status(
    app: AppHandle,
    token_number: i32,
    status: String,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    queue_token_repo::update_queue_token_status(&mut conn, token_number, &status)
        .map_err(|e| e.to_string())
}
