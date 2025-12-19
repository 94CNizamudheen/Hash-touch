
use rusqlite::{params, Connection};
use super::product_tag::ProductTag;

pub fn save_product_tags(
    conn: &mut Connection,
    items: &[ProductTag],
) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for t in items {
        tx.execute(
            r#"
            INSERT INTO product_tags (
              id, tag_group_id, product_id,
              name, price,
              active, sort_order,
              created_at, updated_at, deleted_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
            ON CONFLICT(id) DO UPDATE SET
              tag_group_id = excluded.tag_group_id,
              product_id = excluded.product_id,
              name = excluded.name,
              price = excluded.price,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at
            "#,
            params![
                t.id,
                t.tag_group_id,
                t.product_id,
                t.name,
                t.price,
                t.active,
                t.sort_order,
                t.created_at,
                t.updated_at,
                t.deleted_at
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_product_tags(
    conn: &Connection,
) -> anyhow::Result<Vec<ProductTag>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, tag_group_id, product_id,
          name, price,
          active, sort_order,
          created_at, updated_at, deleted_at
        FROM product_tags
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ProductTag {
            id: row.get(0)?,
            tag_group_id: row.get(1)?,
            product_id: row.get(2)?,
            name: row.get(3)?,
            price: row.get(4)?,
            active: row.get(5)?,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            deleted_at: row.get(9)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_product_tags_by_group(
    conn: &Connection,
    tag_group_id: &str,
) -> anyhow::Result<Vec<ProductTag>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, tag_group_id, product_id,
          name, price,
          active, sort_order,
          created_at, updated_at, deleted_at
        FROM product_tags
        WHERE tag_group_id = ?
          AND deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([tag_group_id], |row| {
        Ok(ProductTag {
            id: row.get(0)?,
            tag_group_id: row.get(1)?,
            product_id: row.get(2)?,
            name: row.get(3)?,
            price: row.get(4)?,
            active: row.get(5)?,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            deleted_at: row.get(9)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}
