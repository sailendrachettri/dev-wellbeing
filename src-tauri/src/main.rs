#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use chrono::Local;
use tauri::{
    command,
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WindowEvent,
};
use tauri_plugin_autostart::MacosLauncher;

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
        // -------- AUTOSTART --------
        .plugin(tauri_plugin_autostart::init(
            MacosLauncher::LaunchAgent,
            None,
        ))
        // -------- TRAY --------
        .setup(|app| {
            let handle = app.handle();
            setup_tray(&handle)?;

            if let Some(win) = app.get_webview_window("main") {
                win.hide()?;
            }

            Ok(())
        })
        // -------- HIDE ON CLOSE --------
        .on_window_event(|app, event| {
    if let WindowEvent::CloseRequested { api, .. } = event {
        if let Some(win) = app.get_webview_window("main") {
            let _ = win.hide();
        }
        api.prevent_close();
    }
})

        // ---------------- Commands ----------------
        .invoke_handler(tauri::generate_handler![
            get_active_app,
            save_app_usage,
            get_usage_today,
            get_usage_by_date,
            get_daily_usage,
            get_usage_weekly,
            get_usage_monthly,
            get_usage_yearly
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let open = MenuItem::with_id(app, "open", "Open Dashboard", true, Option::<&str>::None)?;

    let quit = MenuItem::with_id(app, "quit", "Quit", true, Option::<&str>::None)?;
    let menu = Menu::with_items(app, &[&open, &PredefinedMenuItem::separator(app)?, &quit])?;

    TrayIconBuilder::new()
        .menu(&menu)
        .on_menu_event(|app, event| match event.id().as_ref() {
            "open" => {
                if let Some(win) = app.get_webview_window("main") {
                    win.show().unwrap();
                    win.set_focus().unwrap();
                }
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(|tray, event| {
            if let TrayIconEvent::DoubleClick { .. } = event {
                let app = tray.app_handle();
                if let Some(win) = app.get_webview_window("main") {
                    win.show().unwrap();
                    win.set_focus().unwrap();
                }
            }
        })
        .build(app)?;

    Ok(())
}

// daily uses with pagination just like in android digital wellbeing
#[command]
fn get_daily_usage(limit: i64, offset: i64) -> Vec<db::DailyTotalUsage> {
    db::get_daily_totals(limit, offset).unwrap_or_default()
}

#[command]
fn get_usage_by_date(date: String) -> Vec<db::AppUsage> {
    db::get_usage_by_date(&date).unwrap_or_default()
}

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
