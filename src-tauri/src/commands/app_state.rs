use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::app_state_repo;

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
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    app_state_repo::update_app_state(&conn, "selected_location_id", &location_id)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "brand_id", &brand_id)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_device_role(
    app: AppHandle,
    role: String,
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    app_state_repo::update_app_state(&conn, "device_role", &role)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn set_order_mode_ids(
    app: AppHandle,
    order_mode_ids: Vec<String>,
) -> Result<(), String> {
    let conn = migrate::connection(&app);

    let json = serde_json::to_string(&order_mode_ids)
        .map_err(|e| e.to_string())?;

    app_state_repo::update_app_state(&conn, "order_mode_ids", &json)
        .map_err(|e| e.to_string())?;

    Ok(())
}
