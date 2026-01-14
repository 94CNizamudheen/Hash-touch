use tauri::AppHandle;
#[cfg(desktop)]
use tauri::Manager;
#[cfg(not(any(target_os = "android", target_os = "ios")))]
use tauri::{WebviewUrl, WebviewWindowBuilder};
use crate::db::migrate;
use crate::db::models::app_state_repo;
#[cfg(desktop)]
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
    location_name: String
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

    // Start WebSocket server on desktop when role is POS
    #[cfg(desktop)]
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
pub fn set_setup_code(
    app: AppHandle,
    setup_code: String,
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    app_state_repo::update_app_state(&conn, "setup_code", &setup_code)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_order_modes(
    app: AppHandle,
    order_mode_ids: Vec<String>,
    order_mode_names: Vec<String>,
    default_mode_id: String,
    default_mode_name: String,
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

    app_state_repo::update_app_state(&conn, "selected_order_mode_id", &default_mode_id)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "selected_order_mode_name", &default_mode_name)
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
pub fn set_logo_url(app: AppHandle, logo_url: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    app_state_repo::update_app_state(&conn, "logo_url", &logo_url)
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
    let server_url = state.ws_server_url.unwrap_or_else(|| "".to_string());

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

    // Disable foreign key checks temporarily
    conn.execute("PRAGMA foreign_keys = OFF", [])
        .map_err(|e| e.to_string())?;

    // Clear all tables (order doesn't matter now with FK disabled)
        let tables_to_clear = vec![
            // deepest children first
            "product_tag_group_mappings",
            "product_group_categories",
            "charge_mappings",
            "product_tag_groups",
            "product_tags",
            "product_groups",
            "charges",
            "products",
            "categories",
            "cart_draft",
            "work_shift_draft",
            "payment_methods",
            "transaction_types",
            "device_profiles",
            "setups",
        ];

    for table in tables_to_clear {
        match conn.execute(&format!("DELETE FROM {}", table), []) {
            Ok(deleted) => log::info!("✅ Cleared {} rows from {}", deleted, table),
            Err(e) => log::warn!("⚠️  Failed to clear {}: {}", table, e),
        }
    }

    // Re-enable foreign key checks
    conn.execute("PRAGMA foreign_keys = ON", [])
        .map_err(|e| e.to_string())?;

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


/// Desktop-only: Open a new window for a specific role
/// On Android/iOS, multi-window is not supported
#[cfg(not(any(target_os = "android", target_os = "ios")))]
#[tauri::command]
pub async fn open_role_window(
    app: AppHandle,
    role: String,
) -> Result<(), String> {
    let timestamp = chrono::Utc::now().timestamp();
    let window_label = format!("{}-{}", role.to_lowercase(), timestamp);

    let title = match role.as_str() {
        "POS" => "Point of Sale",
        "KDS" => "Kitchen Display System",
        "KIOSK" => "Self-Ordering Kiosk",
        "QUEUE" => "Queue Display",
        _ => "HashOne Touch",
    };

    log::info!("🪟 Attempting to open {} window", role);

    // Check if a window with this role already exists
    let existing_labels: Vec<String> = app.webview_windows()
        .keys()
        .filter(|label| label.starts_with(&format!("{}-", role.to_lowercase())))
        .cloned()
        .collect();

    if !existing_labels.is_empty() {
        log::info!("🔍 Found existing {} window: {}", role, existing_labels[0]);
        // Focus existing window instead of creating a new one
        if let Some(window) = app.get_webview_window(&existing_labels[0]) {
            match window.set_focus() {
                Ok(_) => {
                    log::info!("✅ Focused existing {} window", role);
                    return Ok(());
                }
                Err(e) => {
                    log::warn!("⚠️  Failed to focus window: {}", e);
                    // Continue to create new window if focus fails
                }
            }
        }
    }

    // Create new window with role parameter in URL
    let url = format!("/?role={}", role);

    log::info!("🚀 Creating new window: {} with URL: {}", window_label, url);

    match WebviewWindowBuilder::new(
        &app,
        window_label.clone(),
        WebviewUrl::App(url.into())
    )
    .title(title)
    .inner_size(1024.0, 768.0)
    .resizable(true)
    .center()
    .build() {
        Ok(_) => {
            log::info!("✅ Successfully opened {} window: {}", role, window_label);
            Ok(())
        }
        Err(e) => {
            log::error!("❌ Failed to create window: {}", e);
            Err(format!("Failed to create window: {}", e))
        }
    }
}

/// Mobile stub: Multi-window not supported on Android/iOS
#[cfg(any(target_os = "android", target_os = "ios"))]
#[tauri::command]
pub async fn open_role_window(
    _app: AppHandle,
    role: String,
) -> Result<(), String> {
    log::warn!("🚫 open_role_window called on mobile - multi-window not supported for role: {}", role);
    Err("Multi-window is not supported on mobile devices".to_string())
}

/// Get all configured device roles from the database
/// Returns a list of roles that have been set up
#[tauri::command]
pub fn get_configured_roles(app: AppHandle) -> Result<Vec<String>, String> {
    let conn = migrate::connection(&app);
    
    log::info!("📋 Fetching configured roles from device_profiles table");
    
    // Get all configured roles from device_profiles table
    let mut stmt = conn.prepare(
        "SELECT DISTINCT role FROM device_profiles WHERE role IS NOT NULL"
    ).map_err(|e| {
        log::error!("❌ Failed to prepare SQL statement: {}", e);
        e.to_string()
    })?;
    
    let roles = stmt.query_map([], |row| {
        let role: String = row.get(0)?;
        Ok(role)
    })
    .map_err(|e| {
        log::error!("❌ Failed to query roles: {}", e);
        e.to_string()
    })?
    .collect::<Result<Vec<String>, _>>()
    .map_err(|e| {
        log::error!("❌ Failed to collect roles: {}", e);
        e.to_string()
    })?;
    
    log::info!("✅ Found {} configured roles: {:?}", roles.len(), roles);
    Ok(roles)
}