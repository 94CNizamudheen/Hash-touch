use rusqlite::{params, Connection};
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Location {
    pub server_id: String,
    pub name: String,
    pub active: bool,
    pub selected: bool,
}

/* =========================
   WRITE OPERATIONS → &mut
========================= */

pub fn upsert(conn: &mut Connection, items: &[Location]) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for l in items {
        tx.execute(
        r#"
        INSERT INTO location (server_id, name, active, selected)
        VALUES (?1, ?2, ?3, ?4)
        ON CONFLICT(server_id) DO UPDATE SET
            name = excluded.name,
            active = excluded.active
        "#,
        params![
            &l.server_id,
            &l.name,
            l.active as i32,
            l.selected as i32
        ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn select(conn: &mut Connection, server_id: &str) -> anyhow::Result<()> {
    conn.execute("UPDATE location SET selected = 0", [])?;
    conn.execute(
        "UPDATE location SET selected = 1 WHERE server_id = ?1",
        params![server_id],
    )?;
    Ok(())
}

/* =========================
   READ OPERATIONS → &
========================= */

pub fn list_active(conn: &Connection) -> anyhow::Result<Vec<Location>> {
    let mut stmt = conn.prepare(
        "SELECT server_id, name, active, selected FROM location WHERE active = 1",
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Location {
            server_id: row.get(0)?,
            name: row.get(1)?,
            active: row.get::<_, i32>(2)? == 1,
            selected: row.get::<_, i32>(3)? == 1,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}
