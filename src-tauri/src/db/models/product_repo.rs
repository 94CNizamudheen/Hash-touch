
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
              price, active, sort_order,
              created_at, updated_at, deleted_at, media, overrides
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
            ON CONFLICT(id) DO UPDATE SET
              name = excluded.name,
              code = excluded.code,
              description = excluded.description,
              category_id = excluded.category_id,
              price = excluded.price,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              media = excluded.media,
              overrides=excluded.overrides
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
                p.created_at,
                p.updated_at,
                p.deleted_at,
                p.media,
                p.overrides
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
          price, active, sort_order,
          created_at, updated_at, deleted_at, media, overrides
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
            created_at: row.get(8)?,
            updated_at: row.get(9)?,
            deleted_at: row.get(10)?,
            media: row.get(11)?,
            overrides:row.get(12)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
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
