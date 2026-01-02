// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::process::Command;
use std::str::from_utf8;

// 搜索结果结构
#[derive(serde::Serialize)]
struct SearchResult {
    file: String,
    line: u32,
    column: u32,
    content: String,
    match_text: String,
}

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
async fn search(
    path: &str,
    pattern: &str,
    case_insensitive: bool,
    whole_word: bool,
    regex: bool,
    ignore_hidden: bool,
    max_depth: u32,
) -> Result<Vec<SearchResult>, String> {
    // 构建ripgrep命令
    let mut cmd = Command::new("rg");
    
    // 添加搜索模式
    cmd.arg(pattern);
    
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
        cmd.arg("-E");
    }
    
    if ignore_hidden {
        cmd.arg("--hidden");
    }
    
    if max_depth > 0 {
        cmd.arg(format!("--max-depth={}", max_depth));
    }
    
    // 设置输出格式: 文件路径:行号:列号:内容
    cmd.arg("--vimgrep");
    
    // 执行命令
    let output = match cmd.output() {
        Ok(output) => output,
        Err(e) => return Err(format!("执行搜索命令失败: {}", e)),
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Fix PATH environment variable on macOS to ensure commands like ripgrep are found
    #[cfg(target_os = "macos")]
    let _ = fix_path_env::fix();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![greet, search])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
