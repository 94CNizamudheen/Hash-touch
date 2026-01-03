use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::workday::Workday;
use crate::db::models::workday_repo;

#[tauri::command]
pub fn save_workday(app: AppHandle, workday: Workday) -> Result<i64, String> {
    println!("🦀 Rust Command: save_workday called for location: {}", workday.location_id);

    let mut conn = migrate::connection(&app);
    workday_repo::save_workday(&mut conn, &workday)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_workdays(app: AppHandle) -> Result<Vec<Workday>, String> {
    let conn = migrate::connection(&app);
    workday_repo::get_all_workdays(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_pending_workdays(app: AppHandle) -> Result<Vec<Workday>, String> {
    let conn = migrate::connection(&app);
    workday_repo::get_pending_workdays(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_workday(app: AppHandle) -> Result<Option<Workday>, String> {
    let conn = migrate::connection(&app);
    workday_repo::get_active_workday(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_workday_by_id(app: AppHandle, id: i64) -> Result<Option<Workday>, String> {
    let conn = migrate::connection(&app);
    workday_repo::get_workday_by_id(&conn, id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_workday_sync_status(
    app: AppHandle,
    id: i64,
    status: String,
    error: Option<String>,
) -> Result<(), String> {
    println!("🦀 Updating workday {} status to: {}", id, status);

    let mut conn = migrate::connection(&app);
    workday_repo::update_workday_sync_status(
        &mut conn,
        id,
        &status,
        error.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn set_workday_server_id(
    app: AppHandle,
    id: i64,
    workday_id: String,
) -> Result<(), String> {
    println!("🦀 Setting workday {} server ID to: {}", id, workday_id);

    let mut conn = migrate::connection(&app);
    workday_repo::set_workday_server_id(&mut conn, id, &workday_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_workday(app: AppHandle, id: i64) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    workday_repo::delete_workday(&mut conn, id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_workdays_by_date_range(
    app: AppHandle,
    start_date: String,
    end_date: String,
) -> Result<Vec<Workday>, String> {
    println!("🦀 Getting workdays between {} and {}", start_date, end_date);

    let conn = migrate::connection(&app);
    workday_repo::get_workdays_by_date_range(&conn, &start_date, &end_date)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_workdays_by_location(
    app: AppHandle,
    location_id: String,
) -> Result<Vec<Workday>, String> {
    println!("🦀 Getting workdays for location: {}", location_id);

    let conn = migrate::connection(&app);
    workday_repo::get_workdays_by_location(&conn, &location_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_workday(
    app: AppHandle,
    id: i64,
    updates: serde_json::Value,
) -> Result<(), String> {
    println!("🦀 Updating workday {} with data: {:?}", id, updates);

    let conn = migrate::connection(&app);

    // Get existing workday
    let mut workday = workday_repo::get_workday_by_id(&conn, id)
        .map_err(|e| e.to_string())?
        .ok_or_else(|| format!("Workday with id {} not found", id))?;

    // Update fields from the updates object
    if let Some(end_user) = updates.get("end_user").and_then(|v| v.as_str()) {
        workday.end_user = Some(end_user.to_string());
    }
    if let Some(end_time) = updates.get("end_time").and_then(|v| v.as_str()) {
        workday.end_time = Some(end_time.to_string());
    }
    if let Some(total_sales) = updates.get("total_sales").and_then(|v| v.as_f64()) {
        workday.total_sales = Some(total_sales);
    }
    if let Some(total_taxes) = updates.get("total_taxes").and_then(|v| v.as_f64()) {
        workday.total_taxes = Some(total_taxes);
    }
    if let Some(total_ticket_count) = updates.get("total_ticket_count").and_then(|v| v.as_i64()) {
        workday.total_ticket_count = Some(total_ticket_count as i32);
    }
    if let Some(updated_at) = updates.get("updated_at").and_then(|v| v.as_str()) {
        workday.updated_at = Some(updated_at.to_string());
    }

    let mut conn = migrate::connection(&app);
    workday_repo::save_workday(&mut conn, &workday)
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub fn clear_all_workdays(app: AppHandle) -> Result<(), String> {
    println!("🦀 Rust Command: clear_all_workdays called");
    let mut conn = migrate::connection(&app);
    workday_repo::clear_all_workdays(&mut conn)
        .map_err(|e| e.to_string())
}
