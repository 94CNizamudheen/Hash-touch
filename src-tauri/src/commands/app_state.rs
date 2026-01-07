
use tauri::{AppHandle, Manager};
use crate::db::migrate;
use crate::db::models::app_state_repo;
use crate::WsState;
use local_ip_address::local_ip;

#[tauri::command]
pub fn get_app_state(app: AppHandle) -> Result<crate::db::models::app_state::AppState, String> {
    let conn = migrate::connection(&app);
    app_state_repo::get_app_state(&conn).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_tenant(
    app: AppHandle,
    domain: String,
    token: String,
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    app_state_repo::update_app_state(&conn, "tenant_domain", &domain)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "access_token", &token)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_location(
    app: AppHandle,
    location_id: String,
    brand_id: String,
    location_name:String
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    app_state_repo::update_app_state(&conn, "selected_location_id", &location_id)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "brand_id", &brand_id)
        .map_err(|e| e.to_string())?;

     app_state_repo::update_app_state(&conn, "selected_location_name", &location_name)
        .map_err(|e| e.to_string())?;


    Ok(())
}

#[tauri::command]
pub fn set_device_role(app: AppHandle, role: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "device_role", &role)
        .map_err(|e| e.to_string())?;

    if role == "POS" {
        let state = app.state::<WsState>();
        let server = state.server.clone();

        tauri::async_runtime::spawn(async move {
            let addr = "0.0.0.0:9001";
            log::info!("🚀 Starting WebSocket server on {}", addr);

            if let Err(e) = server.start(addr).await {
                log::error!("❌ WebSocket server failed: {}", e);
            }
        });
    }

    Ok(())
}


#[tauri::command]
pub fn set_order_modes(
    app: AppHandle,
    order_mode_ids: Vec<String>,
    order_mode_names: Vec<String>,
    default_mode_id:String,
    default_mode_name:String,
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    let ids_json = serde_json::to_string(&order_mode_ids)
        .map_err(|e| e.to_string())?;

    let names_json = serde_json::to_string(&order_mode_names)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "order_mode_ids", &ids_json)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "order_mode_names", &names_json)
        .map_err(|e| e.to_string())?;

     app_state_repo::update_app_state( &conn, "selected_order_mode_id",&default_mode_id,)
    .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state( &conn, "selected_order_mode_name", &default_mode_name,)
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_theme(app: AppHandle, theme: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "theme", &theme)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_language(app: AppHandle, language: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "language", &language)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_kds_settings(app: AppHandle) -> Result<String, String> {
    let conn = migrate::connection(&app);
    let state = app_state_repo::get_app_state(&conn).map_err(|e| e.to_string())?;
    Ok(state.kds_settings.unwrap_or_else(|| "{}".to_string()))
}

#[tauri::command]
pub fn set_kds_settings(app: AppHandle, settings: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "kds_settings", &settings)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_kds_view_mode(app: AppHandle) -> Result<String, String> {
    let conn = migrate::connection(&app);
    let state = app_state_repo::get_app_state(&conn).map_err(|e| e.to_string())?;
    Ok(state.kds_view_mode.unwrap_or_else(|| "grid".to_string()))
}

#[tauri::command]
pub fn set_kds_view_mode(app: AppHandle, mode: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "kds_view_mode", &mode)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_ws_settings(app: AppHandle) -> Result<(bool, String), String> {
    let conn = migrate::connection(&app);
    let state = app_state_repo::get_app_state(&conn).map_err(|e| e.to_string())?;

    let server_mode = state.ws_server_mode.unwrap_or(0) == 1;
    let server_url = state.ws_server_url.unwrap_or_else(|| "ws://localhost:9001".to_string());

    Ok((server_mode, server_url))
}

#[tauri::command]
pub fn set_ws_server_mode(app: AppHandle, enabled: bool) -> Result<(), String> {
    let conn = migrate::connection(&app);
    let value = if enabled { "1" } else { "0" };
    app_state_repo::update_app_state(&conn, "ws_server_mode", value)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn set_ws_server_url(app: AppHandle, url: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "ws_server_url", &url)
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn get_local_ip() -> Result<String, String> {
    local_ip()
        .map(|ip| ip.to_string())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_app_state(app: AppHandle) -> Result<(), String> {
    let conn = migrate::connection(&app);

    conn.execute(
        r#"
        UPDATE app_state SET
          tenant_domain = NULL,
          access_token = NULL,
          selected_location_id = NULL,
          selected_location_name = NULL,
          brand_id = NULL,
          order_mode_ids = '[]',
          order_mode_names = '[]',
          selected_order_mode_id = NULL,
          selected_order_mode_name = NULL,
          device_role = NULL,
          sync_status = 'IDLE',
          kds_view_mode = 'grid',
          kds_settings = '{}'
        WHERE id = 1
        "#,
        [],
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn clear_all_data(app: AppHandle) -> Result<(), String> {
    let conn = migrate::connection(&app);
    log::info!("🗑️  Starting complete database clear...");

    // Clear all tables
    let tables_to_clear = vec![
        "products",
        "product_groups",
        "product_group_categories",
        "product_tag_groups",
        "product_tags",
        "categories",
        "tickets",
        "kds_tickets",
        "charges",
        "charge_mappings",
        "payment_methods",
        "transaction_types",
        "printers",
        "locations",
        "devices",
        "cart_draft",
        "work_shift_draft",
        "queue_tokens"
    ];

    for table in tables_to_clear {
        match conn.execute(&format!("DELETE FROM {}", table), []) {
            Ok(deleted) => log::info!("✅ Cleared {} rows from {}", deleted, table),
            Err(e) => log::warn!("⚠️  Failed to clear {}: {}", table, e),
        }
    }

    // Reset app_state
    conn.execute(
        r#"
        UPDATE app_state SET
          tenant_domain = NULL,
          access_token = NULL,
          selected_location_id = NULL,
          selected_location_name = NULL,
          brand_id = NULL,
          order_mode_ids = '[]',
          order_mode_names = '[]',
          selected_order_mode_id = NULL,
          selected_order_mode_name = NULL,
          device_role = NULL,
          sync_status = 'IDLE',
          kds_view_mode = 'grid',
          kds_settings = '{}',
          ws_server_mode = 0,
          ws_server_url = 'ws://localhost:9001'
        WHERE id = 1
        "#,
        [],
    )
    .map_err(|e| e.to_string())?;

    log::info!("✅ All data cleared successfully");
    Ok(())
}
