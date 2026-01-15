use std::ffi::OsStr;
use std::os::windows::ffi::OsStrExt;

use base64::{engine::general_purpose, Engine as _};
use image::{ImageBuffer, Rgba};
use windows::{
    core::PCWSTR,
    Win32::{
        Foundation::HWND,
        Graphics::Gdi::{
            BITMAP, BITMAPINFO, BITMAPINFOHEADER,
            BI_RGB, DIB_RGB_COLORS,
            GetDC, ReleaseDC,
            GetDIBits, GetObjectW, DeleteObject,
        },
        UI::{
            Shell::{SHGetFileInfoW, SHFILEINFOW, SHGFI_ICON, SHGFI_LARGEICON},
            WindowsAndMessaging::{ICONINFO, GetIconInfo, DestroyIcon},
        },
    },
};
use windows::Win32::UI::Shell::SHGFI_USEFILEATTRIBUTES;
use windows::Win32::Storage::FileSystem::FILE_ATTRIBUTE_NORMAL;


fn to_wide(path: &str) -> Vec<u16> {
    OsStr::new(path).encode_wide().chain(Some(0)).collect()
}

#[tauri::command]
pub fn get_app_icon(app_path: String) -> Option<String> {
    unsafe {
        let mut file_info = SHFILEINFOW::default();
        let wide = to_wide(&app_path);

       SHGetFileInfoW(
    PCWSTR(wide.as_ptr()),
    FILE_ATTRIBUTE_NORMAL,                // <-- treat path as normal file
    Some(&mut file_info),
    std::mem::size_of::<SHFILEINFOW>() as u32,
    SHGFI_ICON | SHGFI_LARGEICON | SHGFI_USEFILEATTRIBUTES,
);

        let hicon = file_info.hIcon;
        if hicon.0 == 0 {
            return None;
        }

        let mut icon_info = ICONINFO::default();
        GetIconInfo(hicon, &mut icon_info).ok()?;

        let mut bmp = BITMAP::default();
        GetObjectW(
            icon_info.hbmColor,
            std::mem::size_of::<BITMAP>() as i32,
            Some(&mut bmp as *mut _ as *mut _),
        );

        let width = bmp.bmWidth as u32;
        let height = bmp.bmHeight as u32;

        let mut buffer = vec![0u8; (width * height * 4) as usize];

        let hdc = GetDC(HWND(0));
        let mut bi = BITMAPINFO::default();
        bi.bmiHeader.biSize = std::mem::size_of::<BITMAPINFOHEADER>() as u32;
        bi.bmiHeader.biWidth = width as i32;
        bi.bmiHeader.biHeight = -(height as i32);
        bi.bmiHeader.biPlanes = 1;
        bi.bmiHeader.biBitCount = 32;
       bi.bmiHeader.biCompression = BI_RGB.0;

        GetDIBits(
            hdc,
            icon_info.hbmColor,
            0,
            height,
            Some(buffer.as_mut_ptr() as *mut _),
            &mut bi,
            DIB_RGB_COLORS,
        );

        ReleaseDC(HWND(0), hdc);
        DeleteObject(icon_info.hbmColor);
        DeleteObject(icon_info.hbmMask);
        let _ = DestroyIcon(hicon);

        let img: ImageBuffer<Rgba<u8>, _> =
            ImageBuffer::from_raw(width, height, buffer)?;

        let mut png = Vec::new();
        img.write_to(
            &mut std::io::Cursor::new(&mut png),
            image::ImageOutputFormat::Png,
        )
        .ok()?;

        Some(format!(
            "data:image/png;base64,{}",
            general_purpose::STANDARD.encode(png)
        ))
    }
}
