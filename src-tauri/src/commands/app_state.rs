
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

