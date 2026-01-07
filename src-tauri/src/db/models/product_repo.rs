
use rusqlite::{params, Connection};
use super::product::Product;

pub fn save_products(conn: &mut Connection, items: &[Product]) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    // Debug: Log products with overrides
    let with_overrides: Vec<_> = items.iter()
        .filter(|p| p.overrides.is_some() && !p.overrides.as_ref().unwrap().is_empty() && p.overrides.as_ref().unwrap() != "[]")
        .collect();

    if !with_overrides.is_empty() {
        println!("🦀 Rust: Saving {} products with overrides (out of {} total)", with_overrides.len(), items.len());
        if let Some(sample) = with_overrides.first() {
            println!("🦀 Rust: Sample product: {} - overrides: {:?}", sample.name, sample.overrides);
        }
    } else {
        println!("🦀 Rust: No products with overrides found in batch of {}", items.len());
    }

    for p in items {
        tx.execute(
            r#"
            INSERT INTO products (
              id, name, code, description, category_id,
              price, active, sort_order, is_sold_out,
              created_at, updated_at, deleted_at, media, overrides, is_product_tag
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              code = excluded.code,
              description = excluded.description,
              category_id = excluded.category_id,
              price = excluded.price,
              active = excluded.active,
              sort_order = excluded.sort_order,
              is_sold_out = COALESCE(excluded.is_sold_out, is_sold_out),
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              media = excluded.media,
              overrides=excluded.overrides,
              is_product_tag=excluded.is_product_tag
            "#,
            params![
                p.id,
                p.name,
                p.code,
                p.description,
                p.category_id,
                p.price,
                if p.active { 1 } else { 0 },
                p.sort_order,
                p.is_sold_out,
                p.created_at,
                p.updated_at,
                p.deleted_at,
                p.media,
                p.overrides,
                p.is_product_tag
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_products(conn: &Connection) -> anyhow::Result<Vec<Product>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, name, code, description, category_id,
          price, active, sort_order, is_sold_out,
          created_at, updated_at, deleted_at, media, overrides, is_product_tag
        FROM products
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Product {
            id: row.get(0)?,
            name: row.get(1)?,
            code: row.get(2)?,
            description: row.get(3)?,
            category_id: row.get(4)?,
            price: row.get(5)?,
            active: row.get::<_, i32>(6)? != 0,
            sort_order: row.get(7)?,
            is_sold_out: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
            deleted_at: row.get(11)?,
            media: row.get(12)?,
            overrides:row.get(13)?,
            is_product_tag:row.get(14)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn update_sold_out_status(conn: &mut Connection, product_id: &str, is_sold_out: bool) -> anyhow::Result<()> {
    conn.execute(
        "UPDATE products SET is_sold_out = ?1 WHERE id = ?2",
        params![if is_sold_out { 1 } else { 0 }, product_id],
    )?;
    Ok(())
}

pub fn clear_all(conn: &mut Connection) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    tx.execute("DELETE FROM product_tags", [])?;
    tx.execute("DELETE FROM product_tag_groups", [])?;
    tx.execute("DELETE FROM products", [])?;
    tx.execute("DELETE FROM product_group_categories", [])?;
    tx.execute("DELETE FROM product_groups", [])?;

    tx.commit()?;
    Ok(())
}
