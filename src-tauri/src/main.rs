#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;

use chrono::Local;
use std::collections::HashMap;
use tauri::command;

use windows::{
    core::PWSTR,
    Win32::Foundation::HANDLE,
    Win32::UI::WindowsAndMessaging::{
        GetForegroundWindow,
        GetWindowThreadProcessId,
    },
    Win32::System::Threading::{
        OpenProcess,
        QueryFullProcessImageNameW,
        PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    },
};

#[command]
fn save_app_usage(app_name: String, seconds: i64) {
    let today = Local::now().format("%Y-%m-%d").to_string();
    db::add_usage(&app_name, &today, seconds);
}

#[command]
fn get_usage_today() -> Vec<db::AppUsage> {
    db::get_usage_today().unwrap_or_default()
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

        let process: HANDLE = OpenProcess(
            PROCESS_QUERY_LIMITED_INFORMATION,
            false,
            pid,
        ).ok()?;

        let mut buffer = [0u16; 260];
        let mut size = buffer.len() as u32;

        QueryFullProcessImageNameW(
            process,
            PROCESS_NAME_FORMAT(0),
            PWSTR(buffer.as_mut_ptr()),
            &mut size,
        ).ok()?;

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

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            get_active_app,
            save_app_usage,
            get_usage_today
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
