use rusqlite::{Connection, params};
use super::app_state::AppState;

pub fn get_app_state(conn: &Connection) -> anyhow::Result<AppState> {
    match conn.query_row(
        r#"
        SELECT tenant_domain,
               access_token,
               selected_location_id,
               selected_location_name,
               brand_id,
               order_mode_ids,
               order_mode_names,
               selected_order_mode_id,
               selected_order_mode_name,
               device_role,
               sync_status,
               theme,
               language,
               kds_view_mode,
               kds_settings
        FROM app_state
        WHERE id = 1
        "#,
        [],
        |row| {
            let raw_order_ids: Option<String> = row.get(5)?;
            let raw_order_names: Option<String> = row.get(6)?;

            let order_mode_ids =
                raw_order_ids.and_then(|json| serde_json::from_str(&json).ok());
            let order_mode_names =
                raw_order_names.and_then(|json| serde_json::from_str(&json).ok());

            Ok(AppState {
                tenant_domain: row.get(0)?,
                access_token: row.get(1)?,
                selected_location_id: row.get(2)?,
                selected_location_name: row.get(3)?,
                brand_id: row.get(4)?,
                order_mode_ids,
                order_mode_names,
                selected_order_mode_id: row.get(7)?,
                selected_order_mode_name: row.get(8)?,
                device_role: row.get(9)?,
                sync_status: row.get(10)?,
                theme: row.get(11)?,
                language: row.get(12)?,
                kds_view_mode: row.get(13)?,
                kds_settings: row.get(14)?,
            })
        },
    ) {
        Ok(state) => Ok(state),

        Err(rusqlite::Error::QueryReturnedNoRows) => {
            // Initialize row if not exists
            conn.execute(
                "INSERT INTO app_state (id, sync_status, kds_view_mode, kds_settings) VALUES (1, 'IDLE', 'grid', '{}')",
                [],
            )?;

            Ok(AppState {
                tenant_domain: None,
                access_token: None,
                selected_location_id: None,
                selected_location_name: None,
                brand_id: None,
                order_mode_ids: Some(vec![]),
                order_mode_names: Some(vec![]),
                selected_order_mode_id: None,
                selected_order_mode_name: None,
                device_role: None,
                sync_status: Some("IDLE".to_string()),
                theme: Some("light".to_string()),
                language: Some("en".to_string()),
                kds_view_mode: Some("grid".to_string()),
                kds_settings: Some("{}".to_string()),
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


// pub fn clear_device_data(conn: &Connection) -> anyhow::Result<()> {
//     conn.execute(
//         r#"
//         UPDATE app_state
//         SET selected_location_id = NULL,
//             selected_location_name = NULL,
//             order_mode_ids = NULL,
//             order_mode_names = NULL,
//             selected_order_mode_id = NULL,
//             selected_order_mode_name = NULL,
//             device_role = NULL,
//             kds_view_mode = 'grid',
//             kds_settings = '{}',
//             updated_at = CURRENT_TIMESTAMP
//         WHERE id = 1
//         "#,
//         [],
//     )?;
//     Ok(())
// }
