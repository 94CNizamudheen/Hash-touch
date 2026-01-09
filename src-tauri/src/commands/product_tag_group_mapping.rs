use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product_tag_group_mapping::ProductTagGroupMapping;
use crate::db::models::product_tag_group_mapping_repo;

#[tauri::command]
pub fn save_product_tag_group_mappings(
    app: AppHandle,
    items: Vec<ProductTagGroupMapping>,
) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    product_tag_group_mapping_repo::save_product_tag_group_mappings(&mut conn, &items)
        .map_err(|e| e.to_string())
}
