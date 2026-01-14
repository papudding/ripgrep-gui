// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod content_search;
mod entity;
mod filename_search;
mod logger;
mod util;
use content_search::search;
use filename_search::search_filename;
use log::info;
use logger::{get_log_directory, setup_logger};
use std::path::PathBuf;
use tauri::Manager;
use util::open_file_with_app;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Fix PATH environment variable on macOS to ensure commands like ripgrep are found
    #[cfg(target_os = "macos")]
    let _ = fix_path_env::fix();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .setup(|app| {
            // 获取日志目录
            let log_dir = match get_log_directory(&app.handle()) {
                Ok(dir) => dir,
                Err(e) => {
                    eprintln!("获取日志目录失败: {}", e);
                    // 使用默认目录
                    match app.handle().path().app_data_dir() {
                        Ok(data_dir) => data_dir.join("logs"),
                        Err(path_err) => {
                            eprintln!("获取应用数据目录失败: {}", path_err);
                            // 最后 fallback 到当前目录
                            std::env::current_dir().unwrap_or_else(|_| PathBuf::from(".")).join("logs")
                        }
                    }
                }
            };
            println!("日志目录: {:?}", log_dir);
            // 初始化日志系统
            if let Err(e) = setup_logger(&app.handle(), &log_dir) {
                eprintln!("初始化日志系统失败: {}", e);
            }
            info!("Ripgrep GUI 应用启动");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            search,
            search_filename,
            open_file_with_app,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}


