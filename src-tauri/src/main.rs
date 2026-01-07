#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use chrono::Local;
use tauri::command;
use tauri::Manager;

use windows::{
    core::PWSTR,
    Win32::Foundation::HANDLE,
    Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    },
    Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowThreadProcessId},
};

fn main() {
    //  db::populate_dummy_data();

    tauri::Builder::default()
        .setup(|app| {
            let log_dir = app.path().app_log_dir().unwrap();
            println!("Log dir: {:?}", log_dir);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_active_app,
            save_app_usage,
            get_usage_today,
            get_usage_weekly,
            get_usage_monthly,
            get_usage_yearly
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}

#[command]
fn save_app_usage(app_name: String, seconds: i64) {
     println!("SAVE CALLED → {} {}s", app_name, seconds);
    let today = Local::now().format("%Y-%m-%d").to_string();
    db::add_usage(&app_name, &today, seconds);
}

#[command]
fn get_usage_today() -> Vec<db::AppUsage> {
    db::get_usage_today().unwrap_or_default()
}

#[command]
fn get_usage_weekly() -> Vec<db::AppUsage> {
    db::get_usage_period("week").unwrap_or_default()
}

#[command]
fn get_usage_monthly() -> Vec<db::AppUsage> {
    db::get_usage_period("month").unwrap_or_default()
}

#[command]
fn get_usage_yearly() -> Vec<db::AppUsage> {
    db::get_usage_period("year").unwrap_or_default()
}

#[command]
fn get_active_app() -> Option<String> {
    unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.0 == 0 {
            return None;
        }

        let mut pid: u32 = 0;
        GetWindowThreadProcessId(hwnd, Some(&mut pid));

        let process: HANDLE = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, false, pid).ok()?;

        let mut buffer = [0u16; 260];
        let mut size = buffer.len() as u32;

        QueryFullProcessImageNameW(
            process,
            PROCESS_NAME_FORMAT(0),
            PWSTR(buffer.as_mut_ptr()),
            &mut size,
        )
        .ok()?;

        let full_path = String::from_utf16_lossy(&buffer[..size as usize]);

        Some(
            full_path
                .rsplit('\\')
                .next()
                .unwrap_or(&full_path)
                .to_string(),
        )
    }
}
