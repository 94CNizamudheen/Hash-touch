use rusqlite::{params, Connection};
use super::transaction_type::TransactionType;

pub fn save_transaction_types(conn: &mut Connection, items: &[TransactionType]) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for tt in items {
        tx.execute(
            r#"
            INSERT INTO transaction_types (
              id, code, name,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
            ON CONFLICT(id) DO UPDATE SET
              code = excluded.code,
              name = excluded.name,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              updated_by = excluded.updated_by,
              deleted_by = excluded.deleted_by
            "#,
            params![
                tt.id,
                tt.code,
                tt.name,
                tt.active,
                tt.sort_order,
                tt.created_at,
                tt.updated_at,
                tt.deleted_at,
                tt.created_by,
                tt.updated_by,
                tt.deleted_by,
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_transaction_types(conn: &Connection) -> anyhow::Result<Vec<TransactionType>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, code, name,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by
        FROM transaction_types
        WHERE deleted_at IS NULL AND active = 1
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(TransactionType {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            active: row.get(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
            deleted_at: row.get(7)?,
            created_by: row.get(8)?,
            updated_by: row.get(9)?,
            deleted_by: row.get(10)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn clear_all(conn: &mut Connection) -> anyhow::Result<()> {
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM transaction_types", [])?;
    tx.commit()?;
    Ok(())
}
