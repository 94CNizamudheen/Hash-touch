
use rusqlite::Connection;
use crate::db::models::{
    product::Product,
    product_tag_group::ProductTagGroup,
};
use super::product_combo::{
    ProductWithCombinations,
    TagGroupWithTags,
    ProductTagOption,
};

pub fn get_product_with_combinations(
    conn: &Connection,
    product_id: &str,
) -> anyhow::Result<ProductWithCombinations> {

    // ---------------- PRODUCT ----------------
    let product: Product = conn.query_row(
        r#"
        SELECT
          id, name, description, price, media
        FROM products
        WHERE id = ? AND deleted_at IS NULL
        "#,
        [product_id],
        |row| {
            Ok(Product {
                id: row.get(0)?,
                name: row.get(1)?,
                description: row.get(2)?,
                price: row.get(3)?,
                media: row.get(4)?,
                code: None,
                category_id: None,
                active: true,
                sort_order: 0,
                created_at: None,
                updated_at: None,
                deleted_at: None,
            })
        },
    )?;

    // ---------------- TAG GROUPS ----------------
    let mut stmt_groups = conn.prepare(
        r#"
        SELECT
          id, name, min_items, max_items
        FROM product_tag_groups
        WHERE product_id = ?
          AND active = 1
          AND deleted_at IS NULL
        ORDER BY sort_order
        "#
    )?;

    let groups_iter = stmt_groups.query_map([product_id], |row| {
        Ok(ProductTagGroup {
            id: row.get(0)?,
            name: row.get(1)?,
            min_items: row.get(2)?,
            max_items: row.get(3)?,
            product_id: product_id.to_string(),
            active: 1,
            sort_order: 0,
            created_at: None,
            updated_at: None,
            deleted_at: None,
        })
    })?;

    let mut groups_with_tags = Vec::new();

    for g in groups_iter {
        let g = g?;

        // ---------------- TAGS ----------------
        let mut stmt_tags = conn.prepare(
            r#"
            SELECT
              id, product_id, name, price
            FROM product_tags
            WHERE tag_group_id = ?
              AND active = 1
              AND deleted_at IS NULL
            ORDER BY sort_order
            "#
        )?;

        let tags_iter = stmt_tags.query_map([&g.id], |row| {
            Ok(ProductTagOption {
                id: row.get(0)?,
                product_id: row.get(1)?,
                name: row.get(2)?,
                price: row.get(3)?,
            })
        })?;

        let options = tags_iter.filter_map(Result::ok).collect();

        groups_with_tags.push(TagGroupWithTags {
            id: g.id,
            name: g.name,
            min_items: g.min_items,
            max_items: g.max_items,
            options,
        });
    }

    Ok(ProductWithCombinations {
        id: product.id,
        name: product.name,
        price: product.price,
        description: product.description,
        media: product.media,
        combinations: groups_with_tags,
    })
}
