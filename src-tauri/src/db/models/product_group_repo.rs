
use rusqlite::{params, Connection};
use super::product_group::ProductGroup;

pub fn save_product_groups(
    conn: &mut Connection,
    items: &[ProductGroup],
) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for g in items {
        tx.execute(
            r#"
            INSERT INTO product_groups (
              id, name, code, description,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by,
              media
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              code = excluded.code,
              description = excluded.description,
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
                g.id,
                g.name,
                g.code,
                g.description,
                g.active,
                g.sort_order,
                g.created_at,
                g.updated_at,
                g.deleted_at,
                g.created_by,
                g.updated_by,
                g.deleted_by,
                g.media
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_product_groups(
    conn: &Connection,
) -> anyhow::Result<Vec<ProductGroup>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, name, code, description,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by,
          media
        FROM product_groups
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ProductGroup {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            description: row.get(3)?,
            active: row.get(4)?,
            sort_order: row.get(5)?,
            created_at: row.get(6)?,
            updated_at: row.get(7)?,
            deleted_at: row.get(8)?,
            created_by: row.get(9)?,
            updated_by: row.get(10)?,
            deleted_by: row.get(11)?,
            media: row.get(12)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}
