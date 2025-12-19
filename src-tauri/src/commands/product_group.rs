
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product_group::ProductGroup;
use crate::db::models::product_group_repo;

#[tauri::command]
pub fn save_product_groups(
    app: AppHandle,
    items: Vec<ProductGroup>,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_group_repo::save_product_groups(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product_groups(
    app: AppHandle,
) -> Result<Vec<ProductGroup>, String> {
    let conn = migrate::connection(&app);
    product_group_repo::get_product_groups(&conn)
        .map_err(|e| e.to_string())
}

