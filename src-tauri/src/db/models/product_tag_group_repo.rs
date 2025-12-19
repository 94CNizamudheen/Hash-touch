
use rusqlite::{params, Connection};
use super::product_tag_group::ProductTagGroup;

pub fn save_product_tag_groups(
    conn: &mut Connection,
    items: &[ProductTagGroup],
) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for g in items {
        tx.execute(
            r#"
            INSERT INTO product_tag_groups (
              id, product_id,
              name,
              min_items, max_items,
              active, sort_order,
              created_at, updated_at, deleted_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            ON CONFLICT(id) DO UPDATE SET
              product_id = excluded.product_id,
              name = excluded.name,
              min_items = excluded.min_items,
              max_items = excluded.max_items,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            "#,
            params![
                g.id,
                g.product_id,
                g.name,
                g.min_items,
                g.max_items,
                g.active,
                g.sort_order,
                g.created_at,
                g.updated_at,
                g.deleted_at
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_product_tag_groups(
    conn: &Connection,
) -> anyhow::Result<Vec<ProductTagGroup>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, product_id,
          name,
          min_items, max_items,
          active, sort_order,
          created_at, updated_at, deleted_at
        FROM product_tag_groups
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ProductTagGroup {
            id: row.get(0)?,
            product_id: row.get(1)?,
            name: row.get(2)?,
            min_items: row.get(3)?,
            max_items: row.get(4)?,
            active: row.get(5)?,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            deleted_at: row.get(9)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_product_tag_groups_by_product(
    conn: &Connection,
    product_id: &str,
) -> anyhow::Result<Vec<ProductTagGroup>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, product_id,
          name,
          min_items, max_items,
          active, sort_order,
          created_at, updated_at, deleted_at
        FROM product_tag_groups
        WHERE product_id = ?
          AND deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([product_id], |row| {
        Ok(ProductTagGroup {
            id: row.get(0)?,
            product_id: row.get(1)?,
            name: row.get(2)?,
            min_items: row.get(3)?,
            max_items: row.get(4)?,
            active: row.get(5)?,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            deleted_at: row.get(9)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}
