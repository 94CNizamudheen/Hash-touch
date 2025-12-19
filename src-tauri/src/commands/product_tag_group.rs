
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product_tag_group::ProductTagGroup;
use crate::db::models::product_tag_group_repo;

#[tauri::command]
pub fn save_product_tag_groups(
    app: AppHandle,
    items: Vec<ProductTagGroup>,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_tag_group_repo::save_product_tag_groups(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product_tag_groups(
    app: AppHandle,
) -> Result<Vec<ProductTagGroup>, String> {
    let conn = migrate::connection(&app);
    product_tag_group_repo::get_product_tag_groups(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product_tag_groups_by_product(
    app: AppHandle,
    product_id: String,
) -> Result<Vec<ProductTagGroup>, String> {
    let conn = migrate::connection(&app);
    product_tag_group_repo::get_product_tag_groups_by_product(&conn, &product_id)
        .map_err(|e| e.to_string())
}
