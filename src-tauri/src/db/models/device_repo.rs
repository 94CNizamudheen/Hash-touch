use rusqlite::{params, Connection};
use super::device::DeviceProfile;

pub fn get_devices(conn: &Connection) -> anyhow::Result<Vec<DeviceProfile>> {
    let mut stmt = conn.prepare(
        "SELECT id, name, role, config, sync_status FROM device_profiles"
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(DeviceProfile {
            id: row.get(0)?,
            name: row.get(1)?,
            role: row.get(2)?,
            config: row.get(3).ok(),
            sync_status: row.get(4).ok(),
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn save_device(conn: &mut Connection, device: &DeviceProfile) -> anyhow::Result<()> {
    conn.execute(
        r#"
        INSERT INTO device_profiles (id, name, role, config, sync_status)
        VALUES (?1, ?2, ?3, ?4, ?5)
        "#,
        params![
            device.id,
            device.name,
            device.role,
            device.config,
            device.sync_status
        ],
    )?;
    Ok(())
}
