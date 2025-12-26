use rusqlite::{params, Connection};
use super::charges::{Charge, ChargeMapping};

pub fn save_charges(conn: &mut Connection, items: &[Charge]) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for c in items {
        tx.execute(
            r#"
            INSERT INTO charges (
              id, code, name, percentage, is_tax, transaction_type_id, parent_charge_id,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
            ON CONFLICT(id) DO UPDATE SET
              code = excluded.code,
              name = excluded.name,
              percentage = excluded.percentage,
              is_tax = excluded.is_tax,
              transaction_type_id = excluded.transaction_type_id,
              parent_charge_id = excluded.parent_charge_id,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              updated_by = excluded.updated_by,
              deleted_by = excluded.deleted_by
            "#,
            params![
                c.id,
                c.code,
                c.name,
                c.percentage,
                c.is_tax,
                c.transaction_type_id,
                c.parent_charge_id,
                c.active,
                c.sort_order,
                c.created_at,
                c.updated_at,
                c.deleted_at,
                c.created_by,
                c.updated_by,
                c.deleted_by,
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn save_charge_mappings(conn: &mut Connection, items: &[ChargeMapping]) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    for m in items {
        tx.execute(
            r#"
            INSERT INTO charge_mappings (
              id, charge_id, category_id, product_id, product_group_id,
              active, sort_order,
              created_at, updated_at, deleted_at,
              created_by, updated_by, deleted_by
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13)
            ON CONFLICT(id) DO UPDATE SET
              charge_id = excluded.charge_id,
              category_id = excluded.category_id,
              product_id = excluded.product_id,
              product_group_id = excluded.product_group_id,
              active = excluded.active,
              sort_order = excluded.sort_order,
              updated_at = excluded.updated_at,
              deleted_at = excluded.deleted_at,
              updated_by = excluded.updated_by,
              deleted_by = excluded.deleted_by
            "#,
            params![
                m.id,
                m.charge_id,
                m.category_id,
                m.product_id,
                m.product_group_id,
                m.active,
                m.sort_order,
                m.created_at,
                m.updated_at,
                m.deleted_at,
                m.created_by,
                m.updated_by,
                m.deleted_by,
            ],
        )?;
    }

    tx.commit()?;
    Ok(())
}

pub fn get_charges(conn: &Connection) -> anyhow::Result<Vec<Charge>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, code, name, percentage, is_tax, transaction_type_id, parent_charge_id,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by
        FROM charges
        WHERE deleted_at IS NULL
        ORDER BY sort_order, name
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Charge {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            percentage: row.get(3)?,
            is_tax: row.get(4)?,
            transaction_type_id: row.get(5)?,
            parent_charge_id: row.get(6)?,
            active: row.get(7)?,
            sort_order: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
            deleted_at: row.get(11)?,
            created_by: row.get(12)?,
            updated_by: row.get(13)?,
            deleted_by: row.get(14)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_charge_mappings(conn: &Connection) -> anyhow::Result<Vec<ChargeMapping>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, charge_id, category_id, product_id, product_group_id,
          active, sort_order,
          created_at, updated_at, deleted_at,
          created_by, updated_by, deleted_by
        FROM charge_mappings
        WHERE deleted_at IS NULL
        ORDER BY sort_order
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(ChargeMapping {
            id: row.get(0)?,
            charge_id: row.get(1)?,
            category_id: row.get(2)?,
            product_id: row.get(3)?,
            product_group_id: row.get(4)?,
            active: row.get(5)?,
            sort_order: row.get(6)?,
            created_at: row.get(7)?,
            updated_at: row.get(8)?,
            deleted_at: row.get(9)?,
            created_by: row.get(10)?,
            updated_by: row.get(11)?,
            deleted_by: row.get(12)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn clear_all(conn: &mut Connection) -> anyhow::Result<()> {
    let tx = conn.transaction()?;

    tx.execute("DELETE FROM charge_mappings", [])?;
    tx.execute("DELETE FROM charges", [])?;

    tx.commit()?;
    Ok(())
}
