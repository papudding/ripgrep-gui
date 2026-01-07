// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;
use std::str::from_utf8;

// 导入 Tauri Shell 扩展，用于 Sidecar 调用
use tauri_plugin_shell::ShellExt;

// 导入Windows特定的process扩展
#[cfg(target_os = "windows")]
use std::os::windows::process::CommandExt;

// Windows特定的创建标志，用于隐藏控制台窗口
#[cfg(target_os = "windows")]
const CREATE_NO_WINDOW: u32 = 0x08000000;

// 搜索结果结构
#[derive(serde::Serialize)]
struct SearchResult {
    file: String,
    line: u32,
    column: u32,
    content: String,
    match_text: String,
}

/// 检测系统是否安装了 rg (ripgrep) 工具
fn check_rg_availability() -> bool {
    // 尝试执行 rg --version 命令来检测系统是否安装了 rg 工具
    let output = Command::new("rg").arg("--version").output();

    match output {
        Ok(output) => output.status.success(),
        Err(_) => false, // 命令执行失败，说明系统没有安装 rg 工具
    }
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn search(
    app: tauri::AppHandle,
    path: &str,
    pattern: &str,
    case_insensitive: bool,
    whole_word: bool,
    regex: bool,
    ignore_hidden: bool,
    max_depth: u32,
) -> Result<Vec<SearchResult>, String> {
    // 检测系统是否安装了 rg 工具
    let system_rg_available = check_rg_availability();

    // 执行搜索并获取输出
    let output = if system_rg_available {
        // 系统已安装 rg 工具，使用系统 rg
        println!("使用系统安装的 rg 工具");

        // 构建ripgrep命令
        let mut cmd = Command::new("rg");

        // Windows系统：设置隐藏窗口标志
        #[cfg(target_os = "windows")]
        cmd.creation_flags(CREATE_NO_WINDOW);

        // 添加搜索模式
        if !regex {
            cmd.arg(pattern);
        }

        // 添加搜索路径
        cmd.arg(path);

        // 添加搜索选项
        if case_insensitive {
            cmd.arg("-i");
        }

        if whole_word {
            cmd.arg("-w");
        }

        if regex {
            cmd.arg("-e");
            cmd.arg(pattern);
        }

        if !ignore_hidden {
            cmd.arg("--hidden");
        }

        if max_depth > 0 {
            cmd.arg(format!("--max-depth={}", max_depth));
        }

        // 设置输出格式: 文件路径:行号:列号:内容
        cmd.arg("--vimgrep");

        // 执行命令
        match cmd.output() {
            Ok(output) => output,
            Err(e) => return Err(format!("执行系统 rg 命令失败: {}", e)),
        }
    } else {
        // 系统未安装 rg 工具，使用内置的 rg Sidecar
        println!("系统未安装 rg 工具，使用内置的 rg Sidecar");

        // 导入必要的类型
        use tauri_plugin_shell::process::CommandEvent;

        // 构建 Sidecar 命令
        let sidecar_command = app
            .shell()
            .sidecar("rg")
            .map_err(|e| format!("创建 rg Sidecar 命令失败: {}", e))?;

        // 构建命令参数
        let mut args = Vec::new();

        // 添加搜索模式
        if !regex {
            args.push(pattern.to_string());
        }

        // 添加搜索路径
        args.push(path.to_string());

        // 添加搜索选项
        if case_insensitive {
            args.push("-i".to_string());
        }

        if whole_word {
            args.push("-w".to_string());
        }

        if regex {
            args.push("-e".to_string());
            args.push(pattern.to_string());
        }

        if !ignore_hidden {
            args.push("--hidden".to_string());
        }

        if max_depth > 0 {
            args.push(format!("--max-depth={}", max_depth));
        }

        // 设置输出格式: 文件路径:行号:列号:内容
        args.push("--vimgrep".to_string());

        // 执行 Sidecar 命令
        let (mut rx, mut _child) = sidecar_command
            .args(args)
            .spawn()
            .map_err(|e| format!("执行内置 rg Sidecar 命令失败: {}", e))?;

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
        std::process::Output {
            status: std::process::ExitStatus::default(),
            stdout,
            stderr,
        }
    };

    // 检查命令是否成功执行
    // ripgrep在没有找到结果时返回非零状态码，这是正常行为，不是错误
    let stderr = from_utf8(&output.stderr).unwrap_or("无法解析错误信息");
    if !output.status.success() {
        // 只有当stderr有内容时才视为真正的错误
        // 否则，只是没有找到结果，返回空数组
        if !stderr.is_empty() {
            return Err(format!("{}", stderr));
        }
        // 没有结果，返回空数组
        return Ok(Vec::new());
    }

    // 解析输出
    let stdout = from_utf8(&output.stdout).unwrap_or("");
    let mut results = Vec::new();

    // 设置结果数量上限，防止返回过多数据导致前端卡顿
    const MAX_RESULTS: usize = 10000;

    for line in stdout.lines() {
        // 超过上限则停止解析
        if results.len() >= MAX_RESULTS {
            break;
        }

        // 分割行: 根据操作系统调整分割逻辑
        let mut file = String::new();
        let mut line_num = 0;
        let mut column = 0;
        let mut content = String::new();

        if std::env::consts::OS == "windows" {
            // Windows系统：路径可能包含盘符，如C:\path\to\file，所以分成5段
            let parts: Vec<&str> = line.splitn(5, ':').collect();
            if parts.len() == 5 {
                file = format!("{}:{}", parts[0], parts[1]);
                line_num = parts[2].parse::<u32>().unwrap_or(0);
                column = parts[3].parse::<u32>().unwrap_or(0);
                content = parts[4].to_string();
            }
        } else {
            // 非Windows系统：正常分成4段
            let parts: Vec<&str> = line.splitn(4, ':').collect();
            if parts.len() == 4 {
                file = parts[0].to_string();
                line_num = parts[1].parse::<u32>().unwrap_or(0);
                column = parts[2].parse::<u32>().unwrap_or(0);
                content = parts[3].to_string();
            }
        }

        // 如果成功解析，添加到结果
        if !file.is_empty() {
            results.push(SearchResult {
                file,
                line: line_num,
                column,
                content,
                match_text: pattern.to_string(),
            });
        }
    }

    Ok(results)
}

#[tauri::command]
async fn search_filename(
    path: &str,
    pattern: &str,
    exact_match: bool,
    ignore_hidden: bool,
    max_depth: u32,
) -> Result<Vec<SearchResult>, String> {
    // 设置结果数量上限，防止返回过多数据导致前端卡顿
    const MAX_RESULTS: usize = 10000;
    let mut results = Vec::new();

    // 定义递归搜索函数
    fn search_recursive(
        current_path: &str,
        pattern: &str,
        exact_match: bool,
        ignore_hidden: bool,
        max_depth: u32,
        current_depth: u32,
        results: &mut Vec<SearchResult>,
    ) -> Result<(), std::io::Error> {
        // 检查深度限制
        if max_depth > 0 && current_depth > max_depth {
            return Ok(());
        }

        // 打开目录
        let entries = std::fs::read_dir(current_path)?;

        for entry in entries {
            let entry = entry?;
            let metadata = entry.metadata()?;
            let path = entry.path();
            let filename = entry.file_name().to_string_lossy().to_string();

            // 检查是否为隐藏文件
            let is_hidden = if cfg!(target_os = "windows") {
                // Windows: 检查文件属性
                #[cfg(target_os = "windows")]
                {
                    use std::os::windows::fs::MetadataExt;
                    metadata.file_attributes() & 2 != 0 // FILE_ATTRIBUTE_HIDDEN
                }
                #[cfg(not(target_os = "windows"))]
                {
                    false
                }
            } else {
                // Unix-like: 检查文件名是否以点开头
                filename.starts_with('.')
            };

            if ignore_hidden && is_hidden {
                continue;
            }

            if metadata.is_file() {
                // 检查文件名匹配
                let matches = if exact_match {
                    filename == pattern
                } else {
                    filename.contains(pattern)
                };

                if matches {
                    // 添加结果
                    if results.len() < MAX_RESULTS {
                        results.push(SearchResult {
                            file: path.to_string_lossy().to_string(),
                            line: 0,
                            column: 0,
                            content: String::new(),
                            match_text: pattern.to_string(),
                        });
                    }
                }
            } else if metadata.is_dir() {
                // 递归搜索子目录
                search_recursive(
                    path.to_str().unwrap(),
                    pattern,
                    exact_match,
                    ignore_hidden,
                    max_depth,
                    current_depth + 1,
                    results,
                )?;
            }
        }

        Ok(())
    }

    // 执行递归搜索
    match search_recursive(
        path,
        pattern,
        exact_match,
        ignore_hidden,
        max_depth,
        0,
        &mut results,
    ) {
        Ok(_) => Ok(results),
        Err(e) => Err(format!("执行文件名搜索失败: {}", e)),
    }
}

#[tauri::command]
async fn open_file_with_app(file_path: &str, app: &str) -> Result<(), String> {
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
            greet,
            search,
            search_filename,
            open_file_with_app
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
