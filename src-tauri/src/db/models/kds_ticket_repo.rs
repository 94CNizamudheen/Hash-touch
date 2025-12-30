use rusqlite::{params, Connection};
use super::kds_ticket::KdsTicket;

pub fn save_kds_ticket(conn: &mut Connection, ticket: &KdsTicket) -> anyhow::Result<()> {
    conn.execute(
        r#"
        INSERT INTO kds_tickets (
          id, ticket_number, order_id, location_id, order_mode_name,
          status, items, total_amount, token_number,
          created_at, updated_at
        )
        VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
        ON CONFLICT(id) DO UPDATE SET
          status = excluded.status,
          items = excluded.items,
          updated_at = excluded.updated_at
        "#,
        params![
            ticket.id,
            ticket.ticket_number,
            ticket.order_id,
            ticket.location_id,
            ticket.order_mode_name,
            ticket.status,
            ticket.items,
            ticket.total_amount,
            ticket.token_number,
            ticket.created_at,
            ticket.updated_at,
        ],
    )?;
    Ok(())
}

pub fn get_all_kds_tickets(conn: &Connection) -> anyhow::Result<Vec<KdsTicket>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, ticket_number, order_id, location_id, order_mode_name,
          status, items, total_amount, token_number,
          created_at, updated_at
        FROM kds_tickets
        ORDER BY created_at ASC
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(KdsTicket {
            id: row.get(0)?,
            ticket_number: row.get(1)?,
            order_id: row.get(2)?,
            location_id: row.get(3)?,
            order_mode_name: row.get(4)?,
            status: row.get(5)?,
            items: row.get(6)?,
            total_amount: row.get(7)?,
            token_number: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_active_kds_tickets(conn: &Connection) -> anyhow::Result<Vec<KdsTicket>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, ticket_number, order_id, location_id, order_mode_name,
          status, items, total_amount, token_number,
          created_at, updated_at
        FROM kds_tickets
        WHERE status != 'READY'
        ORDER BY created_at ASC
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(KdsTicket {
            id: row.get(0)?,
            ticket_number: row.get(1)?,
            order_id: row.get(2)?,
            location_id: row.get(3)?,
            order_mode_name: row.get(4)?,
            status: row.get(5)?,
            items: row.get(6)?,
            total_amount: row.get(7)?,
            token_number: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_kds_tickets_by_status(
    conn: &Connection,
    status: &str,
) -> anyhow::Result<Vec<KdsTicket>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
          id, ticket_number, order_id, location_id, order_mode_name,
          status, items, total_amount, token_number,
          created_at, updated_at
        FROM kds_tickets
        WHERE status = ?1
        ORDER BY created_at ASC
        "#
    )?;

    let rows = stmt.query_map([status], |row| {
        Ok(KdsTicket {
            id: row.get(0)?,
            ticket_number: row.get(1)?,
            order_id: row.get(2)?,
            location_id: row.get(3)?,
            order_mode_name: row.get(4)?,
            status: row.get(5)?,
            items: row.get(6)?,
            total_amount: row.get(7)?,
            token_number: row.get(8)?,
            created_at: row.get(9)?,
            updated_at: row.get(10)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn update_kds_ticket_status(
    conn: &mut Connection,
    ticket_id: &str,
    status: &str,
) -> anyhow::Result<()> {
    let now = chrono::Utc::now().to_rfc3339();

    conn.execute(
        r#"
        UPDATE kds_tickets
        SET status = ?1, updated_at = ?2
        WHERE id = ?3
        "#,
        params![status, now, ticket_id],
    )?;
    Ok(())
}

pub fn delete_kds_ticket(conn: &mut Connection, ticket_id: &str) -> anyhow::Result<()> {
    conn.execute("DELETE FROM kds_tickets WHERE id = ?1", params![ticket_id])?;
    Ok(())
}
