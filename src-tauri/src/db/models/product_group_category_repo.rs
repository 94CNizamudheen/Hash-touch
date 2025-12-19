
use rusqlite::{params, Connection};
use super::product_group_category::ProductGroupCategory;

pub fn save_product_group_categories(
    conn: &mut Connection,
    items: &[ProductGroupCategory],
) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for c in items {
        tx.execute(
            r#"
            INSERT INTO product_group_categories (
              id, product_group_id,
              name, code,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by,
              media
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
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
                c.product_group_id,
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

pub fn get_product_group_categories(
    conn: &Connection,
) -> anyhow::Result<Vec<ProductGroupCategory>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, product_group_id,
          name, code,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by,
          media
        FROM product_group_categories
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ProductGroupCategory {
            id: row.get(0)?,
            product_group_id: row.get(1)?,
            name: row.get(2)?,
            code: row.get(3)?,
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
