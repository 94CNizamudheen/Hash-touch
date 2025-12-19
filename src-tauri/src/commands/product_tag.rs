
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product_tag::ProductTag;
use crate::db::models::product_tag_repo;

#[tauri::command]
pub fn save_product_tags(
    app: AppHandle,
    items: Vec<ProductTag>,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_tag_repo::save_product_tags(&mut conn, &items)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product_tags(
    app: AppHandle,
) -> Result<Vec<ProductTag>, String> {
    let conn = migrate::connection(&app);
    product_tag_repo::get_product_tags(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_product_tags_by_group(
    app: AppHandle,
    tag_group_id: String,
) -> Result<Vec<ProductTag>, String> {
    let conn = migrate::connection(&app);
    product_tag_repo::get_product_tags_by_group(&conn, &tag_group_id)
        .map_err(|e| e.to_string())
}
