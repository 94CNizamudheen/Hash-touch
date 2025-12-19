use rusqlite::{Connection, params};
use super::app_state::AppState;

pub fn get_app_state(conn: &Connection) -> anyhow::Result<AppState> {
    match conn.query_row(
        "SELECT tenant_domain, access_token, selected_location_id, brand_id, order_mode_ids, device_role, sync_status
         FROM app_state WHERE id = 1",
        [],
        |row| {
            // Read JSON string from DB
            let raw_order_modes: Option<String> = row.get(4)?;

            // Deserialize JSON → Vec<String>
            let order_mode_ids = match raw_order_modes {
                Some(json) => serde_json::from_str(&json).ok(),
                None => None,
            };

            Ok(AppState {
                tenant_domain: row.get(0)?,
                access_token: row.get(1)?,
                selected_location_id: row.get(2)?,
                brand_id: row.get(3)?,
                order_mode_ids,
                device_role: row.get(5)?,
                sync_status: row.get(6)?,
            })
        },
    ) {
        Ok(state) => Ok(state),

        Err(rusqlite::Error::QueryReturnedNoRows) => {
            // Initialize the row if it doesn't exist
            conn.execute(
                "INSERT INTO app_state (id, sync_status) VALUES (1, 'IDLE')",
                [],
            )?;

            Ok(AppState {
                tenant_domain: None,
                access_token: None,
                selected_location_id: None,
                brand_id: None,
                order_mode_ids: Some(vec![]), // important default
                device_role: None,
                sync_status: Some("IDLE".to_string()),
            })
        }

        Err(e) => Err(e.into()),
    }
}
pub fn update_app_state(
    conn: &Connection,
    field: &str,
    value: &str,
) -> anyhow::Result<()> {
    let sql = format!(
        "UPDATE app_state SET {} = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1",
        field
    );
    conn.execute(&sql, params![value])?;
    Ok(())
}
