// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod content_search;
mod entity;
mod filename_search;
mod util;
use content_search::search;
use filename_search::search_filename;
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
        .invoke_handler(tauri::generate_handler![
            search,
            search_filename,
            open_file_with_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
