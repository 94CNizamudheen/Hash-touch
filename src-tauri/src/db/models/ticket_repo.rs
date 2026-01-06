use rusqlite::{params, Connection};
use super::ticket::Ticket;

pub fn save_ticket(conn: &mut Connection, ticket: &Ticket) -> anyhow::Result<()> {
    conn.execute(
        r#"
        INSERT INTO tickets (
          id, ticket_data, sync_status, sync_error, sync_attempts, order_status,
          location_id, order_mode_name, ticket_amount, items_count,
          queue_number, ticket_number,
          created_at, updated_at, synced_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15)
        ON CONFLICT(id) DO UPDATE SET
          ticket_data = excluded.ticket_data,
          sync_status = excluded.sync_status,
          sync_error = excluded.sync_error,
          sync_attempts = excluded.sync_attempts,
          order_status = excluded.order_status,
          updated_at = excluded.updated_at,
          synced_at = excluded.synced_at
        "#,
        params![
            ticket.id,
            ticket.ticket_data,
            ticket.sync_status,
            ticket.sync_error,
            ticket.sync_attempts,
            ticket.order_status,
            ticket.location_id,
            ticket.order_mode_name,
            ticket.ticket_amount,
            ticket.items_count,
            ticket.queue_number,
            ticket.ticket_number,
            ticket.created_at,
            ticket.updated_at,
            ticket.synced_at,
        ],
    )?;
    Ok(())
}

pub fn get_all_tickets(conn: &Connection) -> anyhow::Result<Vec<Ticket>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, ticket_data, sync_status, sync_error, sync_attempts, order_status,
          location_id, order_mode_name, ticket_amount, items_count,
          queue_number, ticket_number,
          created_at, updated_at, synced_at
        FROM tickets
        ORDER BY created_at DESC
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Ticket {
            id: row.get(0)?,
            ticket_data: row.get(1)?,
            sync_status: row.get(2)?,
            sync_error: row.get(3)?,
            sync_attempts: row.get(4)?,
            order_status: row.get(5)?,
            location_id: row.get(6)?,
            order_mode_name: row.get(7)?,
            ticket_amount: row.get(8)?,
            items_count: row.get(9)?,
            queue_number: row.get(10)?,
            ticket_number: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
            synced_at: row.get(14)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_pending_tickets(conn: &Connection) -> anyhow::Result<Vec<Ticket>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, ticket_data, sync_status, sync_error, sync_attempts, order_status,
          location_id, order_mode_name, ticket_amount, items_count,
          queue_number, ticket_number,
          created_at, updated_at, synced_at
        FROM tickets
        WHERE sync_status = 'PENDING' OR sync_status = 'FAILED'
        ORDER BY created_at ASC
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Ticket {
            id: row.get(0)?,
            ticket_data: row.get(1)?,
            sync_status: row.get(2)?,
            sync_error: row.get(3)?,
            sync_attempts: row.get(4)?,
            order_status: row.get(5)?,
            location_id: row.get(6)?,
            order_mode_name: row.get(7)?,
            ticket_amount: row.get(8)?,
            items_count: row.get(9)?,
            queue_number: row.get(10)?,
            ticket_number: row.get(11)?,
            created_at: row.get(12)?,
            updated_at: row.get(13)?,
            synced_at: row.get(14)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn update_ticket_sync_status(
    conn: &mut Connection,
    ticket_id: &str,
    status: &str,
    error: Option<&str>,
) -> anyhow::Result<()> {
    let now = chrono::Utc::now().to_rfc3339();
    let synced_at = if status == "SYNCED" {
        Some(now.clone())
    } else {
        None
    };

    conn.execute(
        r#"
        UPDATE tickets
        SET sync_status = ?1, sync_error = ?2, updated_at = ?3, synced_at = ?4, sync_attempts = sync_attempts + 1
        WHERE id = ?5
        "#,
        params![status, error, now, synced_at, ticket_id],
    )?;
    Ok(())
}

pub fn delete_ticket(conn: &mut Connection, ticket_id: &str) -> anyhow::Result<()> {
    conn.execute("DELETE FROM tickets WHERE id = ?1", params![ticket_id])?;
    Ok(())
}

pub fn get_sync_stats(conn: &Connection) -> anyhow::Result<(i32, i32, i32)> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          COUNT(CASE WHEN sync_status = 'PENDING' THEN 1 END) as pending,
          COUNT(CASE WHEN sync_status = 'FAILED' THEN 1 END) as failed,
          COUNT(CASE WHEN sync_status = 'SYNCED' THEN 1 END) as synced
        FROM tickets
        "#
    )?;

    let result = stmt.query_row([], |row| {
        Ok((row.get(0)?, row.get(1)?, row.get(2)?))
    })?;

    Ok(result)
}

pub fn clear_all_tickets(conn: &mut Connection) -> anyhow::Result<()> {
    conn.execute("DELETE FROM tickets", [])?;
    Ok(())
}

pub fn update_ticket_order_status(
    conn: &mut Connection,
    ticket_id: &str,
    order_status: &str,
) -> anyhow::Result<()> {
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        r#"
        UPDATE tickets
        SET order_status = ?1, updated_at = ?2
        WHERE id = ?3
        "#,
        params![order_status, now, ticket_id],
    )?;
    Ok(())
}

pub fn get_max_queue_number(
    conn: &Connection,
    location_id: &str,
    business_date: &str,
) -> anyhow::Result<Option<i32>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT MAX(queue_number) as max_queue
        FROM tickets
        WHERE location_id = ?1
          AND DATE(created_at) = DATE(?2)
        "#
    )?;

    let result = stmt.query_row(params![location_id, business_date], |row| {
        row.get(0)
    });

    match result {
        Ok(max_queue) => Ok(max_queue),
        Err(rusqlite::Error::QueryReturnedNoRows) => Ok(None),
        Err(e) => Err(e.into()),
    }
}
