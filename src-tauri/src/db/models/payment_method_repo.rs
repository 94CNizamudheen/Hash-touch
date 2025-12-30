use rusqlite::{params, Connection};
use super::payment_method::PaymentMethod;

pub fn save_payment_methods(conn: &mut Connection, items: &[PaymentMethod]) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for pm in items {
        tx.execute(
            r#"
            INSERT INTO payment_methods (
              id, code, name, processor,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
            ON CONFLICT(id) DO UPDATE SET
              code = excluded.code,
              name = excluded.name,
              processor = excluded.processor,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              updated_by = excluded.updated_by,
              deleted_by = excluded.deleted_by
            "#,
            params![
                pm.id,
                pm.code,
                pm.name,
                pm.processor,
                pm.active,
                pm.sort_order,
                pm.created_at,
                pm.updated_at,
                pm.deleted_at,
                pm.created_by,
                pm.updated_by,
                pm.deleted_by,
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_payment_methods(conn: &Connection) -> anyhow::Result<Vec<PaymentMethod>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, code, name, processor,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by
        FROM payment_methods
        WHERE deleted_at IS NULL AND active = 1
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(PaymentMethod {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            processor: row.get(3)?,
            active: row.get(4)?,
            sort_order: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            deleted_at: row.get(8)?,
            created_by: row.get(9)?,
            updated_by: row.get(10)?,
            deleted_by: row.get(11)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn clear_all(conn: &mut Connection) -> anyhow::Result<()> {
    let tx = conn.transaction()?;
    tx.execute("DELETE FROM payment_methods", [])?;
    tx.commit()?;
    Ok(())
}
