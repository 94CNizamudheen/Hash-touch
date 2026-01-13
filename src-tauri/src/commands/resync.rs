use tauri::AppHandle;
use crate::db::migrate;

#[tauri::command]
pub fn clear_resync_data(app: AppHandle) -> Result<(), String> {
    let conn = migrate::connection(&app);

    log::info!("🧹 Clearing re-sync related tables...");

    let tables_to_clear = vec![
        // Products
        "products",
        "product_groups",
        "product_group_categories",
        "product_tag_groups",
        "product_tag_group_mappings",
        "product_tags",

        // Charges
        "charges",
        "charge_mappings",

        // Payments & Transactions
        "payment_methods",
        "transaction_types",
    ];

    for table in tables_to_clear {
        match conn.execute(&format!("DELETE FROM {}", table), []) {
            Ok(count) => log::info!("✅ Cleared {} rows from {}", count, table),
            Err(e) => log::warn!("⚠️ Failed to clear {}: {}", table, e),
        }
    }

    log::info!("✅ Re-sync data cleared successfully");
    Ok(())
}
