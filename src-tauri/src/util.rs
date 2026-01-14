use log::{debug, error, info};
use tauri::AppHandle;
use std::process::Output;
use std::str::from_utf8;
use tauri::async_runtime::Receiver;
use tauri_plugin_shell::process::CommandEvent;
use tauri_plugin_shell::ShellExt;

#[tauri::command]
pub async fn open_file_with_app(app_handle: AppHandle, file_path: &str, app: &str) -> Result<(), String> {
    info!("打开文件 - 路径: {}, 应用: {}", file_path, app);
    // 尝试执行 fd --version 命令来检测系统是否安装了 fd 工具
    let shell = app_handle.shell();
    
    let output = match cfg!(target_os = "windows") {
        // Windows系统：使用start命令
        true => {
            debug!("Windows系统：使用start命令打开文件");
            shell.command("cmd")
                .arg("/C")
                .arg("start")
                .arg("")
                .arg(app)
                .arg(file_path)
                .output()
                .await
                .map_err(|e| format!("执行start命令失败: {}", e))?
        }
        // macOS系统：使用open -a命令
        false if cfg!(target_os = "macos") => {
            debug!("macOS系统：使用open -a命令打开文件");
            shell.command("open")
                .arg("-a")
                .arg(app)
                .arg(file_path)
                .output()
                .await
                .map_err(|e| format!("执行open命令失败: {}", e))?
        }
        // Linux系统：直接使用应用命令
        false => {
            debug!("Linux系统：直接使用应用命令打开文件");
            shell.command(app)
                .arg(file_path)
                .output()
                .await
                .map_err(|e| format!("执行应用命令失败: {}", e))?
        }
    };

    // 检查命令是否成功执行
    if output.status.success() {
        info!("文件打开成功: {}", file_path);
        Ok(())
    } else {
        let stderr = from_utf8(&output.stderr).unwrap_or("无法解析错误信息");
        error!("打开文件失败: {}", stderr);
        Err(format!("打开文件失败: {}", stderr))
    }
}

/// 从命令执行事件接收器中解析输出
pub async fn parse_output_from_rx(mut rx: Receiver<CommandEvent>) -> Output {
    // 收集输出
    let mut stdout = Vec::new();
    let mut stderr = Vec::new();

    // 处理命令执行事件
    while let Some(event) = rx.recv().await {
        match event {
            CommandEvent::Stdout(line_bytes) => {
                stdout.extend_from_slice(&line_bytes);
            }
            CommandEvent::Stderr(line_bytes) => {
                stderr.extend_from_slice(&line_bytes);
            }
            _ => {}
        }
    }

    // 转换为与系统命令相同的输出格式
    Output {
        status: std::process::ExitStatus::default(),
        stdout,
        stderr,
    }
}
