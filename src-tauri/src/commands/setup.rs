use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::setup::Setup;
use crate::db::models::setup_repo;

#[tauri::command]
pub fn save_setup(
    app: AppHandle,
    setup: Setup,
) -> Result<(), String> {
    let conn = migrate::connection(&app);
    setup_repo::upsert_setup(&conn, &setup)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_setup_by_code(
    app: AppHandle,
    code: String,
) -> Result<Option<Setup>, String> {
    let conn = migrate::connection(&app);
    setup_repo::get_setup_by_code(&conn, &code)
        .map_err(|e| e.to_string())
}
