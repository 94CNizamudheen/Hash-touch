
use rusqlite::{params, Connection};
use super::category::Category;

pub fn save_categories(
    conn: &mut Connection,
    items: &[Category],
) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for c in items {
        tx.execute(
            r#"
            INSERT INTO categories (
              id, name, code,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by,
              media
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              code = excluded.code,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              created_by = excluded.created_by,
              updated_by = excluded.updated_by,
              deleted_by = excluded.deleted_by,
              media = excluded.media
            "#,
            params![
                c.id,
                c.name,
                c.code,
                c.active,
                c.sort_order,
                c.created_at,
                c.updated_at,
                c.deleted_at,
                c.created_by,
                c.updated_by,
                c.deleted_by,
                c.media
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_categories(conn: &Connection) -> anyhow::Result<Vec<Category>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, name, code,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by,
          media
        FROM categories
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Category {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            active: row.get(3)?,
            sort_order: row.get(4)?,
            created_at: row.get(5)?,
            updated_at: row.get(6)?,
            deleted_at: row.get(7)?,
            created_by: row.get(8)?,
            updated_by: row.get(9)?,
            deleted_by: row.get(10)?,
            media: row.get(11)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}
