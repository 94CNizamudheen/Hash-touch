use tauri::AppHandle;
use crate::db::migrate;
use crate::db::models::kds_ticket::KdsTicket;
use crate::db::models::kds_ticket_repo;

#[tauri::command]
pub fn save_kds_ticket(app: AppHandle, ticket: KdsTicket) -> Result<(), String> {
    println!("🦀 Rust Command: save_kds_ticket called for ticket ID: {}", ticket.id);

    let mut conn = migrate::connection(&app);
    kds_ticket_repo::save_kds_ticket(&mut conn, &ticket)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_all_kds_tickets(app: AppHandle) -> Result<Vec<KdsTicket>, String> {
    let conn = migrate::connection(&app);
    kds_ticket_repo::get_all_kds_tickets(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_active_kds_tickets(app: AppHandle) -> Result<Vec<KdsTicket>, String> {
    let conn = migrate::connection(&app);
    kds_ticket_repo::get_active_kds_tickets(&conn)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_kds_tickets_by_status(
    app: AppHandle,
    status: String,
) -> Result<Vec<KdsTicket>, String> {
    let conn = migrate::connection(&app);
    kds_ticket_repo::get_kds_tickets_by_status(&conn, &status)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn update_kds_ticket_status(
    app: AppHandle,
    ticket_id: String,
    status: String,
) -> Result<(), String> {
    println!("🦀 Updating KDS ticket {} status to: {}", ticket_id, status);

    let mut conn = migrate::connection(&app);
    kds_ticket_repo::update_kds_ticket_status(&mut conn, &ticket_id, &status)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_kds_ticket(app: AppHandle, ticket_id: String) -> Result<(), String> {
    println!("🦀 Deleting KDS ticket: {}", ticket_id);

    let mut conn = migrate::connection(&app);
    kds_ticket_repo::delete_kds_ticket(&mut conn, &ticket_id)
        .map_err(|e| e.to_string())
}
