#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

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
        .invoke_handler(tauri::generate_handler![get_active_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri app");
}
