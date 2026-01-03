use rusqlite::{params, Connection, OptionalExtension};
use super::workday::Workday;

pub fn save_workday(conn: &mut Connection, workday: &Workday) -> anyhow::Result<i64> {
    if let Some(id) = workday.id {
        // Update existing workday
        conn.execute(
            r#"
            UPDATE workdays
            SET workday_id = ?1, start_user = ?2, end_user = ?3, start_time = ?4,
                end_time = ?5, location_id = ?6, total_sales = ?7, total_taxes = ?8,
                total_ticket_count = ?9, work_period_informations = ?10,
                department_ticket_informations = ?11, add_on = ?12, auto_closed = ?13,
                external_processed = ?14, work_period_day = ?15, business_date = ?16,
                sync_status = ?17, sync_error = ?18, updated_at = ?19
            WHERE id = ?20
            "#,
            params![
                workday.workday_id,
                workday.start_user,
                workday.end_user,
                workday.start_time,
                workday.end_time,
                workday.location_id,
                workday.total_sales,
                workday.total_taxes,
                workday.total_ticket_count,
                workday.work_period_informations,
                workday.department_ticket_informations,
                workday.add_on,
                workday.auto_closed,
                workday.external_processed,
                workday.work_period_day,
                workday.business_date,
                workday.sync_status,
                workday.sync_error,
                workday.updated_at,
                id,
            ],
        )?;
        Ok(id)
    } else {
        // Insert new workday
        conn.execute(
            r#"
            INSERT INTO workdays (
                workday_id, start_user, end_user, start_time, end_time, location_id,
                total_sales, total_taxes, total_ticket_count, work_period_informations,
                department_ticket_informations, add_on, auto_closed, external_processed,
                work_period_day, business_date, sync_status, sync_error, created_at, updated_at
            )
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13, ?14, ?15, ?16, ?17, ?18, ?19, ?20)
            "#,
            params![
                workday.workday_id,
                workday.start_user,
                workday.end_user,
                workday.start_time,
                workday.end_time,
                workday.location_id,
                workday.total_sales,
                workday.total_taxes,
                workday.total_ticket_count,
                workday.work_period_informations,
                workday.department_ticket_informations,
                workday.add_on,
                workday.auto_closed,
                workday.external_processed,
                workday.work_period_day,
                workday.business_date,
                workday.sync_status,
                workday.sync_error,
                workday.created_at,
                workday.updated_at,
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }
}

pub fn get_all_workdays(conn: &Connection) -> anyhow::Result<Vec<Workday>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
            id, workday_id, start_user, end_user, start_time, end_time, location_id,
            total_sales, total_taxes, total_ticket_count, work_period_informations,
            department_ticket_informations, add_on, auto_closed, external_processed,
            work_period_day, business_date, sync_status, sync_error, created_at, updated_at
        FROM workdays
        ORDER BY created_at DESC
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Workday {
            id: row.get(0)?,
            workday_id: row.get(1)?,
            start_user: row.get(2)?,
            end_user: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            location_id: row.get(6)?,
            total_sales: row.get(7)?,
            total_taxes: row.get(8)?,
            total_ticket_count: row.get(9)?,
            work_period_informations: row.get(10)?,
            department_ticket_informations: row.get(11)?,
            add_on: row.get(12)?,
            auto_closed: row.get(13)?,
            external_processed: row.get(14)?,
            work_period_day: row.get(15)?,
            business_date: row.get(16)?,
            sync_status: row.get(17)?,
            sync_error: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_pending_workdays(conn: &Connection) -> anyhow::Result<Vec<Workday>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
            id, workday_id, start_user, end_user, start_time, end_time, location_id,
            total_sales, total_taxes, total_ticket_count, work_period_informations,
            department_ticket_informations, add_on, auto_closed, external_processed,
            work_period_day, business_date, sync_status, sync_error, created_at, updated_at
        FROM workdays
        WHERE sync_status = 'PENDING'
        ORDER BY created_at DESC
        "#
    )?;

    let rows = stmt.query_map([], |row| {
        Ok(Workday {
            id: row.get(0)?,
            workday_id: row.get(1)?,
            start_user: row.get(2)?,
            end_user: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            location_id: row.get(6)?,
            total_sales: row.get(7)?,
            total_taxes: row.get(8)?,
            total_ticket_count: row.get(9)?,
            work_period_informations: row.get(10)?,
            department_ticket_informations: row.get(11)?,
            add_on: row.get(12)?,
            auto_closed: row.get(13)?,
            external_processed: row.get(14)?,
            work_period_day: row.get(15)?,
            business_date: row.get(16)?,
            sync_status: row.get(17)?,
            sync_error: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_active_workday(conn: &Connection) -> anyhow::Result<Option<Workday>> {
    let result = conn
        .query_row(
            r#"
            SELECT
                id, workday_id, start_user, end_user, start_time, end_time, location_id,
                total_sales, total_taxes, total_ticket_count, work_period_informations,
                department_ticket_informations, add_on, auto_closed, external_processed,
                work_period_day, business_date, sync_status, sync_error, created_at, updated_at
            FROM workdays
            WHERE end_time IS NULL
            ORDER BY created_at DESC
            LIMIT 1
            "#,
            [],
            |row| {
                Ok(Workday {
                    id: row.get(0)?,
                    workday_id: row.get(1)?,
                    start_user: row.get(2)?,
                    end_user: row.get(3)?,
                    start_time: row.get(4)?,
                    end_time: row.get(5)?,
                    location_id: row.get(6)?,
                    total_sales: row.get(7)?,
                    total_taxes: row.get(8)?,
                    total_ticket_count: row.get(9)?,
                    work_period_informations: row.get(10)?,
                    department_ticket_informations: row.get(11)?,
                    add_on: row.get(12)?,
                    auto_closed: row.get(13)?,
                    external_processed: row.get(14)?,
                    work_period_day: row.get(15)?,
                    business_date: row.get(16)?,
                    sync_status: row.get(17)?,
                    sync_error: row.get(18)?,
                    created_at: row.get(19)?,
                    updated_at: row.get(20)?,
                })
            },
        )
        .optional()?;

    Ok(result)
}

pub fn get_workday_by_id(conn: &Connection, id: i64) -> anyhow::Result<Option<Workday>> {
    let result = conn
        .query_row(
            r#"
            SELECT
                id, workday_id, start_user, end_user, start_time, end_time, location_id,
                total_sales, total_taxes, total_ticket_count, work_period_informations,
                department_ticket_informations, add_on, auto_closed, external_processed,
                work_period_day, business_date, sync_status, sync_error, created_at, updated_at
            FROM workdays
            WHERE id = ?1
            "#,
            params![id],
            |row| {
                Ok(Workday {
                    id: row.get(0)?,
                    workday_id: row.get(1)?,
                    start_user: row.get(2)?,
                    end_user: row.get(3)?,
                    start_time: row.get(4)?,
                    end_time: row.get(5)?,
                    location_id: row.get(6)?,
                    total_sales: row.get(7)?,
                    total_taxes: row.get(8)?,
                    total_ticket_count: row.get(9)?,
                    work_period_informations: row.get(10)?,
                    department_ticket_informations: row.get(11)?,
                    add_on: row.get(12)?,
                    auto_closed: row.get(13)?,
                    external_processed: row.get(14)?,
                    work_period_day: row.get(15)?,
                    business_date: row.get(16)?,
                    sync_status: row.get(17)?,
                    sync_error: row.get(18)?,
                    created_at: row.get(19)?,
                    updated_at: row.get(20)?,
                })
            },
        )
        .optional()?;

    Ok(result)
}

pub fn update_workday_sync_status(
    conn: &mut Connection,
    id: i64,
    status: &str,
    error: Option<&str>,
) -> anyhow::Result<()> {
    conn.execute(
        r#"
        UPDATE workdays
        SET sync_status = ?1, sync_error = ?2, updated_at = datetime('now')
        WHERE id = ?3
        "#,
        params![status, error, id],
    )?;
    Ok(())
}

pub fn set_workday_server_id(
    conn: &mut Connection,
    id: i64,
    workday_id: &str,
) -> anyhow::Result<()> {
    conn.execute(
        r#"
        UPDATE workdays
        SET workday_id = ?1, updated_at = datetime('now')
        WHERE id = ?2
        "#,
        params![workday_id, id],
    )?;
    Ok(())
}

pub fn delete_workday(conn: &mut Connection, id: i64) -> anyhow::Result<()> {
    conn.execute("DELETE FROM workdays WHERE id = ?1", params![id])?;
    Ok(())
}

pub fn get_workdays_by_date_range(
    conn: &Connection,
    start_date: &str,
    end_date: &str,
) -> anyhow::Result<Vec<Workday>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
            id, workday_id, start_user, end_user, start_time, end_time, location_id,
            total_sales, total_taxes, total_ticket_count, work_period_informations,
            department_ticket_informations, add_on, auto_closed, external_processed,
            work_period_day, business_date, sync_status, sync_error, created_at, updated_at
        FROM workdays
        WHERE business_date BETWEEN ?1 AND ?2
        ORDER BY business_date DESC, created_at DESC
        "#
    )?;

    let rows = stmt.query_map(params![start_date, end_date], |row| {
        Ok(Workday {
            id: row.get(0)?,
            workday_id: row.get(1)?,
            start_user: row.get(2)?,
            end_user: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            location_id: row.get(6)?,
            total_sales: row.get(7)?,
            total_taxes: row.get(8)?,
            total_ticket_count: row.get(9)?,
            work_period_informations: row.get(10)?,
            department_ticket_informations: row.get(11)?,
            add_on: row.get(12)?,
            auto_closed: row.get(13)?,
            external_processed: row.get(14)?,
            work_period_day: row.get(15)?,
            business_date: row.get(16)?,
            sync_status: row.get(17)?,
            sync_error: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn get_workdays_by_location(
    conn: &Connection,
    location_id: &str,
) -> anyhow::Result<Vec<Workday>> {
    let mut stmt = conn.prepare(
        r#"
        SELECT
            id, workday_id, start_user, end_user, start_time, end_time, location_id,
            total_sales, total_taxes, total_ticket_count, work_period_informations,
            department_ticket_informations, add_on, auto_closed, external_processed,
            work_period_day, business_date, sync_status, sync_error, created_at, updated_at
        FROM workdays
        WHERE location_id = ?1
        ORDER BY created_at DESC
        "#
    )?;

    let rows = stmt.query_map(params![location_id], |row| {
        Ok(Workday {
            id: row.get(0)?,
            workday_id: row.get(1)?,
            start_user: row.get(2)?,
            end_user: row.get(3)?,
            start_time: row.get(4)?,
            end_time: row.get(5)?,
            location_id: row.get(6)?,
            total_sales: row.get(7)?,
            total_taxes: row.get(8)?,
            total_ticket_count: row.get(9)?,
            work_period_informations: row.get(10)?,
            department_ticket_informations: row.get(11)?,
            add_on: row.get(12)?,
            auto_closed: row.get(13)?,
            external_processed: row.get(14)?,
            work_period_day: row.get(15)?,
            business_date: row.get(16)?,
            sync_status: row.get(17)?,
            sync_error: row.get(18)?,
            created_at: row.get(19)?,
            updated_at: row.get(20)?,
        })
    })?;

    Ok(rows.filter_map(Result::ok).collect())
}

pub fn clear_all_workdays(conn: &mut Connection) -> anyhow::Result<()> {
    conn.execute("DELETE FROM workdays", [])?;
    Ok(())
}
