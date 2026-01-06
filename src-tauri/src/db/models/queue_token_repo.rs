

use rusqlite::{params, Connection};
use super::queue_token::QueueToken;

pub fn save_queue_token(
    conn: &mut Connection,
    token: &QueueToken,
) -> anyhow::Result<()> {
    conn.execute(
        r#"
        INSERT INTO queue_tokens (
          id, ticket_id, ticket_number, token_number,
          status, source, location_id, order_mode,
          created_at, called_at, served_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          called_at = excluded.called_at,
          served_at = excluded.served_at
        "#,
        params![
            token.id,
            token.ticket_id,
            token.ticket_number,
            token.token_number,
            token.status,
            token.source,
            token.location_id,
            token.order_mode,
            token.created_at,
            token.called_at,
            token.served_at,
        ],
    )?;
    Ok(())
}

pub fn get_active_queue_tokens(conn: &Connection) -> anyhow::Result<Vec<QueueToken>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT *
        FROM queue_tokens
        WHERE status != 'SERVED'
        ORDER BY created_at ASC
        "#,
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(QueueToken {
            id: row.get(0)?,
            ticket_id: row.get(1)?,
            ticket_number: row.get(2)?,
            token_number: row.get(3)?,
            status: row.get(4)?,
            source: row.get(5)?,
            location_id: row.get(6)?,
            order_mode: row.get(7)?,
            created_at: row.get(8)?,
            called_at: row.get(9)?,
            served_at: row.get(10)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn update_queue_token_status(
    conn: &mut Connection,
    token_number: i32,
    status: &str,
) -> anyhow::Result<()> {
    let now = chrono::Utc::now().to_rfc3339();

    let (called_at, served_at) = match status {
        "CALLED" => (Some(now.clone()), None),
        "SERVED" => (None, Some(now.clone())),
        _ => (None, None),
    };

    conn.execute(
        r#"
        UPDATE queue_tokens
        SET status = ?1,
            called_at = COALESCE(?2, called_at),
            served_at = COALESCE(?3, served_at)
        WHERE token_number = ?4
        "#,
        params![status, called_at, served_at, token_number],
    )?;
    Ok(())
}
