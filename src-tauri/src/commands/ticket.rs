use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::ticket::Ticket;
use crate::db::models::ticket_repo;

#[tauri::command]
pub fn save_ticket(app: AppHandle, ticket: Ticket) -> Result<(), String> {
    println!("🦀 Rust Command: save_ticket called for ticket ID: {}", ticket.id);

    let mut conn = migrate::connection(&app);
    ticket_repo::save_ticket(&mut conn, &ticket)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_tickets(app: AppHandle) -> Result<Vec<Ticket>, String> {
    let conn = migrate::connection(&app);
    ticket_repo::get_all_tickets(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_pending_tickets(app: AppHandle) -> Result<Vec<Ticket>, String> {
    let conn = migrate::connection(&app);
    ticket_repo::get_pending_tickets(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_ticket_sync_status(
    app: AppHandle,
    ticket_id: String,
    status: String,
    error: Option<String>,
) -> Result<(), String> {
    println!("🦀 Updating ticket {} status to: {}", ticket_id, status);

    let mut conn = migrate::connection(&app);
    ticket_repo::update_ticket_sync_status(
        &mut conn,
        &ticket_id,
        &status,
        error.as_deref(),
    )
    .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_ticket(app: AppHandle, ticket_id: String) -> Result<(), String> {
    let mut conn = migrate::connection(&app);
    ticket_repo::delete_ticket(&mut conn, &ticket_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_sync_stats(app: AppHandle) -> Result<(i32, i32, i32), String> {
    let conn = migrate::connection(&app);
    ticket_repo::get_sync_stats(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn clear_all_tickets(app: AppHandle) -> Result<(), String> {
    println!("🦀 Rust Command: clear_all_tickets called");
    let mut conn = migrate::connection(&app);
    ticket_repo::clear_all_tickets(&mut conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_max_queue_number(
    app: AppHandle,
    location_id: String,
    business_date: String,
) -> Result<Option<i32>, String> {
    println!("🦀 Rust Command: get_max_queue_number for location {} on {}", location_id, business_date);
    let conn = migrate::connection(&app);
    ticket_repo::get_max_queue_number(&conn, &location_id, &business_date)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_ticket_order_status(
    app: AppHandle,
    ticket_id: String,
    order_status: String,
) -> Result<(), String> {
    println!("🦀 Rust Command: update_ticket_order_status {} to {}", ticket_id, order_status);
    let mut conn = migrate::connection(&app);
    ticket_repo::update_ticket_order_status(&mut conn, &ticket_id, &order_status)
        .map_err(|e| e.to_string())
}
