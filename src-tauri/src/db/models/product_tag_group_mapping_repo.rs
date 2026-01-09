use rusqlite::{params, Connection};
use super::product_tag_group_mapping::ProductTagGroupMapping;

pub fn save_product_tag_group_mappings(
    conn: &mut Connection,
    items: &[ProductTagGroupMapping],
) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    // Clear existing mappings before inserting new ones
    tx.execute("DELETE FROM product_tag_group_mappings", [])?;

    for m in items {
        tx.execute(
            r#"
            INSERT INTO product_tag_group_mappings (product_id, tag_group_id)
            VALUES (?1, ?2)
            ON CONFLICT(product_id, tag_group_id) DO NOTHING
            "#,
            params![m.product_id, m.tag_group_id],
        )?;
    }

    tx.commit()?;
    Ok(())
}

// pub fn get_tag_groups_by_product(
//     conn: &Connection,
//     product_id: &str,
// ) -> anyhow::Result<Vec<String>> {
//     let mut stmt = conn.prepare(
//         r#"
//         SELECT tag_group_id
//         FROM product_tag_group_mappings
//         WHERE product_id = ?
//         "#
//     )?;

//     let rows = stmt.query_map([product_id], |row| {
//         Ok(row.get::<_, String>(0)?)
//     })?;

//     Ok(rows.filter_map(Result::ok).collect())
// }
