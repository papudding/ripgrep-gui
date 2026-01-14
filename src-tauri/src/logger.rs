use flexi_logger::{Cleanup, Criterion, FileSpec, Logger, Naming};
use log::info;
use std::path::{Path, PathBuf};
use tauri::{AppHandle, Manager};


pub fn setup_logger(_app: &tauri::AppHandle, log_dir: &Path) -> Result<(), Box<dyn std::error::Error>> {
    // 确保日志目录存在
    std::fs::create_dir_all(log_dir)?;

    info!("日志文件将保存到: {}", log_dir.display());

    // 配置 flexi_logger
    Logger::try_with_env_or_str("info")?
        .log_to_file(
            FileSpec::default()
                .directory(log_dir)
                .basename("ripgrep-gui")
                .suffix("log"),
        )
        .rotate(
            Criterion::Age(flexi_logger::Age::Day),
            Naming::Timestamps,
            Cleanup::KeepLogFiles(30),
        )
        .duplicate_to_stdout(flexi_logger::Duplicate::All)
        .format_for_files(flexi_logger::detailed_format)
        .format_for_stdout(flexi_logger::colored_detailed_format)
        .write_mode(flexi_logger::WriteMode::BufferAndFlush)
        .cleanup_in_background_thread(true)
        .start()?;

    Ok(())
}

pub fn get_log_directory(app: &AppHandle) -> Result<PathBuf, Box<dyn std::error::Error>> {
    // 优先使用环境变量
    if let Ok(custom_dir) = std::env::var("RUST_LOG_FILE_DIR") {
        return Ok(PathBuf::from(custom_dir));
    }

    // 其次使用 config.json 中的配置
    // 根据平台获取配置目录
    let config_dir = if cfg!(target_os = "windows") {
        app.path().app_config_dir()?
    } else {
        // macOS 和 Linux 使用 ~/.config/ripgrep-gui
        let home_dir = app.path().home_dir()?;
        home_dir.join(".config").join("ripgrep-gui")
    };
    
    let config_file = config_dir.join("config.json");
    if config_file.exists() {
        if let Ok(content) = std::fs::read_to_string(&config_file) {
            if let Ok(config) = serde_json::from_str::<serde_json::Value>(&content) {
                // 读取 userConfig.logPath
                if let Some(log_dir) = config
                    .get("userConfig")
                    .and_then(|uc| uc.get("logPath"))
                    .and_then(|v| v.as_str()) 
                {
                    return Ok(PathBuf::from(log_dir));
                }
            }
        }
    }

    // 默认使用配置目录下的 logs 目录
    Ok(config_dir.join("logs"))
}
