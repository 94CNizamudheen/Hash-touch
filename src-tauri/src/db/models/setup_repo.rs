
use rusqlite::{Connection, params};
use super::setup::Setup;

pub fn upsert_setup(conn: &Connection, setup: &Setup) -> anyhow::Result<()> {
    conn.execute(
        r#"
        INSERT INTO setups (
            id, code, name, setup_type, channel,
            settings, country_code, currency_code, currency_symbol,
            active, sort_order, created_at, updated_at
        ) VALUES (
            ?1, ?2, ?3, ?4, ?5,
            ?6, ?7, ?8, ?9,
            ?10, ?11, ?12, ?13
        )
        ON CONFLICT(id) DO UPDATE SET
            code = excluded.code,
            name = excluded.name,
            setup_type = excluded.setup_type,
            channel = excluded.channel,
            settings = excluded.settings,
            country_code = excluded.country_code,
            currency_code = excluded.currency_code,
            currency_symbol = excluded.currency_symbol,
            active = excluded.active,
            sort_order = excluded.sort_order,
            updated_at = excluded.updated_at
        "#,
        params![
            setup.id,
            setup.code,
            setup.name,
            setup.setup_type,
            setup.channel,
            setup.settings,
            setup.country_code,
            setup.currency_code,
            setup.currency_symbol,
            setup.active,
            setup.sort_order,
            setup.created_at,
            setup.updated_at
        ],
    )?;
    Ok(())
}

pub fn get_setup_by_code(
    conn: &Connection,
    code: &str,
) -> anyhow::Result<Option<Setup>> {
    // Use explicit column names to avoid order mismatch
    let mut stmt = conn.prepare(
        r#"SELECT
            id, code, name, setup_type, channel, settings,
            country_code, currency_code, currency_symbol,
            active, sort_order, created_at, updated_at
        FROM setups WHERE code = ?1 LIMIT 1"#
    )?;

    let mut rows = stmt.query(params![code])?;

    if let Some(row) = rows.next()? {
        let setup = Setup {
            id: row.get(0)?,
            code: row.get(1)?,
            name: row.get(2)?,
            setup_type: row.get(3)?,
            channel: row.get(4)?,
            settings: row.get(5)?,
            country_code: row.get(6)?,
            currency_code: row.get(7)?,
            currency_symbol: row.get(8)?,
            active: row.get(9)?,
            sort_order: row.get(10)?,
            created_at: row.get(11)?,
            updated_at: row.get(12)?,
        };
        log::info!("📦 Found setup: code={}, settings_len={}",
            setup.code,
            setup.settings.as_ref().map(|s| s.len()).unwrap_or(0)
        );
        Ok(Some(setup))
    } else {
        log::warn!("⚠️ No setup found for code: {}", code);
        Ok(None)
    }
}
