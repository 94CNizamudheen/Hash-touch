
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product_group_category::ProductGroupCategory;
use crate::db::models::product_group_category_repo;

#[tauri::command]
pub fn save_product_group_categories(
    app: AppHandle,
    items: Vec<ProductGroupCategory>,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_group_category_repo::save_product_group_categories(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product_group_categories(
    app: AppHandle,
) -> Result<Vec<ProductGroupCategory>, String> {
    let conn = migrate::connection(&app);
    product_group_category_repo::get_product_group_categories(&conn)
        .map_err(|e| e.to_string())
}
