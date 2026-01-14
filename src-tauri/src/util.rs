use std::process::Command;
use std::str::from_utf8;
#[tauri::command]
pub async fn open_file_with_app(file_path: &str, app: &str) -> Result<(), String> {
    let output = match cfg!(target_os = "windows") {
        // Windows系统：使用start命令
        true => {
            let mut cmd = Command::new("cmd");
            cmd.arg("/C");
            cmd.arg("start");
            cmd.arg(""); // 空标题
            cmd.arg(app);
            cmd.arg(file_path);

            // Windows系统：设置隐藏窗口标志
            #[cfg(target_os = "windows")]
            cmd.creation_flags(CREATE_NO_WINDOW);

            cmd.output()
        }
        // macOS系统：使用open -a命令
        false if cfg!(target_os = "macos") => {
            let mut cmd = Command::new("open");
            cmd.arg("-a");
            cmd.arg(app);
            cmd.arg(file_path);
            cmd.output()
        }
        // Linux系统：直接使用应用命令
        false => {
            let mut cmd = Command::new(app);
            cmd.arg(file_path);
            cmd.output()
        }
    };

    match output {
        Ok(output) => {
            if output.status.success() {
                Ok(())
            } else {
                let stderr = from_utf8(&output.stderr).unwrap_or("无法解析错误信息");
                Err(format!("打开文件失败: {}", stderr))
            }
        }
        Err(e) => Err(format!("执行命令失败: {}", e)),
    }
}