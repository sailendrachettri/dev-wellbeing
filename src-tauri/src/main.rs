#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod db;
use chrono::Local;
use rusqlite::Connection;
use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::async_runtime;
use tauri::{
    command,
    image::Image,
    menu::{Menu, MenuItem},
    tray::{TrayIconBuilder, TrayIconEvent},
    AppHandle, Manager, WindowEvent,
};

use windows::{
    core::PWSTR,
    Win32::Foundation::HANDLE,
    Win32::System::Threading::{
        OpenProcess, QueryFullProcessImageNameW, PROCESS_NAME_FORMAT,
        PROCESS_QUERY_LIMITED_INFORMATION,
    },
    Win32::UI::WindowsAndMessaging::{GetForegroundWindow, GetWindowThreadProcessId},
};

struct ActiveAppState {
    current_app: Arc<Mutex<Option<String>>>,
    start_time: Arc<Mutex<std::time::Instant>>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_autostart::init(
            tauri_plugin_autostart::MacosLauncher::LaunchAgent,
            Some(vec!["--minimized"]),
        ))
        .plugin(tauri_plugin_log::Builder::default().build())
        .plugin(tauri_plugin_notification::init())
        .manage(ActiveAppState {
            current_app: Arc::new(Mutex::new(None)),
            start_time: Arc::new(Mutex::new(std::time::Instant::now())),
        })
        .setup(|app| {
            let handle = app.handle();
            setup_tray(&handle)?;

            // Cleanup  the unnecessary code
            // if let Err(e) = cleanup_invalid_usage_data() {
            //     eprintln!("Cleanup failed: {}", e);
            // }
            

            let args: Vec<String> = std::env::args().collect();
            let minimized = args.contains(&"--minimized".to_string());

            if let Some(win) = app.get_webview_window("main") {
                if minimized {
                    win.hide()?;
                } else {
                    win.show()?;
                    win.set_focus()?;
                }
            }

            start_background_tracking(app.handle().clone());

            Ok(())
        })
        .on_window_event(|app, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                if let Some(win) = app.get_webview_window("main") {
                    let _ = win.hide();
                }
                api.prevent_close();
            }
        })
        .invoke_handler(tauri::generate_handler![
            get_active_app,
            save_app_usage,
            get_usage_today,
            get_usage_by_date,
            get_week_timeline_usage,
            get_earliest_usage_date,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}

fn is_system_app(app_name: &str) -> bool {
    let app = app_name.to_lowercase();

    let system_apps = [
        "WindowsTerminal.exe",
        "explorer",
        "shellexperiencehost",
        "applicationframehost",
        "searchhost",
        "startmenuexperiencehost",
        "systemsettings",
        "lockapp",
        "lock app",
        "runtimebroker",
        "smartscreen",
        "ctfmon",
        "winlogon",
        "dwm",
        "taskmgr",
        "msedgewebview2",
        "webview2",
        "edgewebview",
        "svchost",
        "services",
        "conhost",
        "dllhost",
        "fontdrvhost",
        "csrss",
        "lsass",
        "windowsterminal",
        "powershell",
        "pwsh",
        "cmd",
        "\\windows\\system32",
        "\\windowsapps\\",
        "\\program files\\windowsapps"
    ];

    system_apps.iter().any(|k| app.contains(k))
}


fn start_background_tracking(app: AppHandle) {
    let state = app.state::<ActiveAppState>();
    let current_app = state.current_app.clone();
    let start_time = state.start_time.clone();

    async_runtime::spawn(async move {
        loop {
            async_runtime::spawn_blocking(|| {
                std::thread::sleep(Duration::from_secs(5));
            })
            .await
            .ok();

            let mut active_app = get_active_app();
            /* println!("active app1: {:?}", active_app); */
            active_app = active_app
            .filter(|app| !is_system_app(app));

        /* println!("active app2: {:?}", active_app); */


            let mut current = current_app.lock().unwrap();
            let mut start = start_time.lock().unwrap();

            if let Some(app_name) = &active_app {
                if current.as_ref() != Some(app_name) {
                    if let Some(prev_app) = current.as_ref() {
                        let elapsed = start.elapsed().as_secs() as i64;
                        if elapsed > 0 {
                            let today = Local::now().format("%Y-%m-%d").to_string();
                            db::add_usage(prev_app, &today, elapsed);
                        }
                    }

                    *current = Some(app_name.clone());
                    *start = std::time::Instant::now();
                }
            } else if current.is_some() {
                if let Some(prev_app) = current.take() {
                    let elapsed = start.elapsed().as_secs() as i64;
                    if elapsed > 0 {
                        let today = Local::now().format("%Y-%m-%d").to_string();
                        db::add_usage(&prev_app, &today, elapsed);
                    }
                }
                *start = std::time::Instant::now();
            }
        }
    });
}

fn setup_tray(app: &AppHandle) -> tauri::Result<()> {
    let quit = MenuItem::with_id(app, "quit", "Quit", true, Option::<&str>::None)?;
    let menu = Menu::with_items(app, &[ &quit])?;

    let total_seconds = get_today_total_seconds();
    let tooltip_text = format!("Today: {}", format_seconds_hm(total_seconds));

    let icon = Image::from_bytes(include_bytes!("../icons/icon.ico"))?;

    let app_handle = app.clone();
    let tray_icon = TrayIconBuilder::new()
        .icon(icon)
        .tooltip(&tooltip_text)
        .menu(&menu)
        .on_menu_event(move |app, event| match event.id.as_ref() {
            "quit" => {
                let state = app.state::<ActiveAppState>();
                let current = state.current_app.lock().unwrap();
                let start = state.start_time.lock().unwrap();

                if let Some(app_name) = current.as_ref() {
                    let elapsed = start.elapsed().as_secs() as i64;
                    if elapsed > 0 {
                        let today = Local::now().format("%Y-%m-%d").to_string();
                        db::add_usage(app_name, &today, elapsed);
                    }
                }

                app.exit(0);
            }
            _ => {}
        })
        .on_tray_icon_event(move |_tray, event| {
            if let TrayIconEvent::DoubleClick { .. } = event {
                if let Some(win) = app_handle.get_webview_window("main") {
                    let _ = win.show();
                    let _ = win.set_focus();
                }
            }
        })
        .build(app)?;

    let tray_clone = Arc::new(tray_icon);
    async_runtime::spawn(async move {
        loop {
            async_runtime::spawn_blocking(|| {
                std::thread::sleep(Duration::from_secs(60));
            })
            .await
            .ok();

            let total_seconds = get_today_total_seconds();
            let tooltip_text = format!("Today: {}", format_seconds_hm(total_seconds));
            let _ = tray_clone.set_tooltip(Some(&tooltip_text));
        }
    });

    Ok(())
}

// fn cleanup_invalid_usage_data() -> Result<(), String> {
//     let mut path = dirs::data_dir().ok_or("No data dir")?;
//     path.push("dev-wellbeing");
//     path.push("usage.db");

//     let conn = Connection::open(path).map_err(|e| e.to_string())?;

//     // 1. Remove system apps
//     db::delete_system_apps(&conn).map_err(|e| e.to_string())?;
//     Ok(())
// }



#[command]
fn save_app_usage(app_name: String, seconds: i64) {
    if is_system_app(&app_name) {
        return;
    }

    let today = Local::now().format("%Y-%m-%d").to_string();

    db::add_usage(&app_name, &today, seconds);
}

#[command]
fn get_earliest_usage_date() -> Result<String, String> {
    let mut path = dirs::data_dir().ok_or("No data dir")?;
    path.push("dev-wellbeing");
    std::fs::create_dir_all(&path).ok();
    path.push("usage.db");

    let conn = Connection::open(path).map_err(|e| e.to_string())?;

    db::get_earliest_date(&conn).map_err(|e| e.to_string())
}

#[command]
fn get_today_total_seconds() -> i64 {
    let usage = db::get_usage_today().unwrap_or_default();
    usage.iter().map(|u| u.seconds).sum()
}

fn format_seconds_hm(seconds: i64) -> String {
    let hours = seconds / 3600;
    let minutes = (seconds % 3600) / 60;
    format!("{}h {}m", hours, minutes)
}

#[command]
fn get_week_timeline_usage(start_of_week: String, end_of_week: String) -> Vec<db::DailyTotalUsage> {
    db::get_week_timeline_usage(&start_of_week, &end_of_week).unwrap_or_default()
}

#[command]
fn get_usage_by_date(date: String) -> Vec<db::AppUsage> {
    db::get_usage_by_date(&date).unwrap_or_default()
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
