
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::category::Category;
use crate::db::models::category_repo;

#[tauri::command]
pub fn save_categories(
    app: AppHandle,
    items: Vec<Category>,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    category_repo::save_categories(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_categories(
    app: AppHandle,
) -> Result<Vec<Category>, String> {
    let conn = migrate::connection(&app);
    category_repo::get_categories(&conn)
        .map_err(|e| e.to_string())
}
