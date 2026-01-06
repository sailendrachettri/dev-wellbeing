use rusqlite::{params, Connection, Result};
use std::collections::HashMap;
use std::path::PathBuf;
use rand::Rng;


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

pub fn add_usage(app_name: &str, date: &str, seconds: i64) {
    let conn = get_db().unwrap();

    let updated = conn.execute(
        "UPDATE app_usage
         SET usage_seconds = usage_seconds + ?
         WHERE app_name = ? AND date = ?",
        params![seconds, app_name, date],
    ).unwrap();

    if updated == 0 {
        conn.execute(
            "INSERT INTO app_usage (app_name, date, usage_seconds)
             VALUES (?, ?, ?)",
            params![app_name, date, seconds],
        ).unwrap();
    }
}

#[derive(serde::Serialize)]
pub struct AppUsage {
    pub app: String,
    pub seconds: i64,
}
pub fn populate_dummy_data() {
    use chrono::Duration;
    let conn = get_db().unwrap();
    let mut rng = rand::thread_rng();

    let apps = vec![
        "Chrome.exe",
        "VSCode.exe",
        "Slack.exe",
        "Spotify.exe",
        "Explorer.exe",
        "Notepad.exe",
    ];

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    // Daily usage
    for app in &apps {
        let mins = rng.gen_range(1..60);
        add_usage(app, &today, mins as i64 * 60);
    }

    // Weekly usage
    for i in 1..=7 {
        let date = (chrono::Local::now() - Duration::days(i)).format("%Y-%m-%d").to_string();
        for app in &apps {
            let mins = rng.gen_range(30..120);
            add_usage(app, &date, mins as i64 * 60);
        }
    }

    // Monthly usage
    for i in 1..=30 {
        let date = (chrono::Local::now() - Duration::days(i)).format("%Y-%m-%d").to_string();
        for app in &apps {
            let mins = rng.gen_range(60..180);
            add_usage(app, &date, mins as i64 * 60);
        }
    }

    // Yearly usage (sample every 10 days)
    for i in (0..365).step_by(10) {
        let date = (chrono::Local::now() - Duration::days(i)).format("%Y-%m-%d").to_string();
        for app in &apps {
            let mins = rng.gen_range(120..300);
            add_usage(app, &date, mins as i64 * 60);
        }
    }

    println!("Dummy data inserted!");
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

pub fn get_usage_period(period: &str) -> Result<Vec<AppUsage>> {
    let conn = get_db()?;
    let today = chrono::Local::now();

    // Determine start date based on period
    let start_date = match period {
        "week" => today - chrono::Duration::days(7),
        "month" => today - chrono::Duration::days(30),
        "year" => today - chrono::Duration::days(365),
        _ => today,
    };

    let start_date_str = start_date.format("%Y-%m-%d").to_string();

    let mut stmt = conn.prepare(
        "SELECT app_name, SUM(usage_seconds) as total_seconds
         FROM app_usage
         WHERE date >= ?
         GROUP BY app_name
         ORDER BY total_seconds DESC",
    )?;

    let rows = stmt.query_map([start_date_str], |row| {
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
