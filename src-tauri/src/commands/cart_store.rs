
use tauri::AppHandle;
use rusqlite::{params, OptionalExtension};
use crate::db::migrate;

#[tauri::command]
pub fn get_cart_draft(app: AppHandle) -> Result<Option<String>, String> {
    let conn = migrate::connection(&app);
    let res: Option<String> = conn
        .query_row(
            "SELECT data FROM cart_draft WHERE id = 1",
            [],
            |row| row.get(0),
        )
        .optional()
        .map_err(|e| e.to_string())?;
    Ok(res)
}

#[tauri::command]
pub fn save_cart_draft(app: AppHandle, data: String) -> Result<(), String> {
    let conn = migrate::connection(&app);
    conn.execute(
        "INSERT INTO cart_draft (id, data, updated_at)
         VALUES (1, ?1, datetime('now'))
         ON CONFLICT(id) DO UPDATE
         SET data = excluded.data,
             updated_at = excluded.updated_at",
        params![data],
    )
    .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn clear_cart_draft(app: AppHandle) -> Result<(), String> {
    let conn = migrate::connection(&app);
    conn.execute("DELETE FROM cart_draft WHERE id = 1", [])
        .map_err(|e| e.to_string())?;
    Ok(())
}
