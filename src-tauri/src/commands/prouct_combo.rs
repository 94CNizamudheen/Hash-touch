
use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::product_combo::ProductWithCombinations;
use crate::db::models::product_combo_repo;

#[tauri::command]
pub fn get_product_with_combos(
    app: AppHandle,
    product_id: String,
) -> Result<ProductWithCombinations, String> {
    let conn = migrate::connection(&app);

    product_combo_repo::get_product_with_combinations(&conn, &product_id)
        .map_err(|e| e.to_string())
}
