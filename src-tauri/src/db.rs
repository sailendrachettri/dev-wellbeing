use rusqlite::{params, Connection, Result};
use std::path::PathBuf;

fn get_db() -> Result<Connection> {
    let mut path: PathBuf = dirs::data_dir().expect("no data dir");
    path.push("dev-wellbeing");
    std::fs::create_dir_all(&path).ok();
    path.push("usage.db");

    let conn = Connection::open(path)?;

    conn.execute(
        "CREATE TABLE IF NOT EXISTS app_usage (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            app_name TEXT NOT NULL,
            date TEXT NOT NULL,
            usage_seconds INTEGER NOT NULL
        )",
        [],
    )?;

    Ok(conn)
}

#[derive(serde::Serialize)]
pub struct DailyTotalUsage {
    pub date: String, // "2026-01-07"
    pub total_seconds: i64,
}

// pub fn delete_all_entries() -> Result<()> {
//     let conn = get_db()?;

//     conn.execute("DELETE FROM app_usage", params![])?;
//     println!("All entries deleted from app_usage table.");
//     Ok(())
// }


pub fn get_earliest_date(conn: &Connection) -> Result<String> {
    let mut stmt = conn.prepare("SELECT MIN(date) FROM app_usage")?;
    let earliest_date: String = stmt.query_row([], |row| row.get(0))?;
    Ok(earliest_date)
}

pub fn get_week_timeline_usage(
    start_of_week: &str, // "YYYY-MM-DD"
    end_of_week: &str,   // "YYYY-MM-DD"
) -> rusqlite::Result<Vec<DailyTotalUsage>> {
    let conn = get_db()?;

    let mut stmt = conn.prepare(
        "
        SELECT date, SUM(usage_seconds) AS total_seconds
        FROM app_usage
        WHERE date BETWEEN ?1 AND ?2
        GROUP BY date
        ORDER BY date ASC
        ",
    )?;

    let rows = stmt.query_map(params![start_of_week, end_of_week], |row| {
        Ok(DailyTotalUsage {
            date: row.get(0)?,
            total_seconds: row.get(1)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }

    Ok(result)
}

pub fn get_usage_by_date(date: &str) -> Result<Vec<AppUsage>> {
    let conn = get_db()?;

    let mut stmt = conn.prepare(
        "SELECT app_name, usage_seconds
         FROM app_usage
         WHERE date = ?
         ORDER BY usage_seconds DESC",
    )?;

    let rows = stmt.query_map([date], |row| {
        Ok(AppUsage {
            app: row.get(0)?,
            seconds: row.get(1)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }

    Ok(result)
}

pub fn add_usage(app_name: &str, date: &str, seconds: i64) {
    let conn = get_db().unwrap();

    let updated = conn
        .execute(
            "UPDATE app_usage
         SET usage_seconds = usage_seconds + ?
         WHERE app_name = ? AND date = ?",
            params![seconds, app_name, date],
        )
        .unwrap();

    if updated == 0 {
        conn.execute(
            "INSERT INTO app_usage (app_name, date, usage_seconds)
             VALUES (?, ?, ?)",
            params![app_name, date, seconds],
        )
        .unwrap();
    }
}

#[derive(serde::Serialize)]
pub struct AppUsage {
    pub app: String,
    pub seconds: i64,
}

pub fn get_usage_today() -> Result<Vec<AppUsage>> {
    let conn = get_db()?;
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let mut stmt = conn.prepare(
        "SELECT app_name, usage_seconds
         FROM app_usage
         WHERE date = ?
         ORDER BY usage_seconds DESC",
    )?;

    let rows = stmt.query_map([today], |row| {
        Ok(AppUsage {
            app: row.get(0)?,
            seconds: row.get(1)?,
        })
    })?;

    let mut result = Vec::new();
    for row in rows {
        result.push(row?);
    }

    Ok(result)
}
