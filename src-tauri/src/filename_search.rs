use std::str::from_utf8;

use crate::{entity::{FilenameSearchParams, SearchResult}, util::parse_output_from_rx};
use tauri::AppHandle;
use tauri_plugin_shell::ShellExt;


/// 检测系统是否安装了 fd (find) 工具
async fn check_fd_availability(app: &tauri::AppHandle) -> Result<bool, String> {
    // 尝试执行 fd --version 命令来检测系统是否安装了 fd 工具
    let shell = app.shell();
    let out_put = shell
        .command("fd")
        .arg("--version")
        .output()
        .await
        .map_err(|e| format!("执行 fd 命令失败: {}", e))?;

    if out_put.status.success() {
        Ok(true)
    } else {
        Err(format!(
            "命令执行失败, 状态码: {}",
            out_put.status.code().unwrap_or_default()
        ))
    }
}


// 设置结果数量上限，防止返回过多数据导致前端卡顿
const MAX_RESULTS: usize = 10000;
/// 构建 fd 命令的参数
fn build_fd_args(filename_search_params: &FilenameSearchParams) -> Vec<String> {
    let mut args = vec![
        filename_search_params.pattern.to_string(),
        filename_search_params.path.to_string(),
        "--absolute-path".to_string(),
    ];

    // 设置深度限制
    if filename_search_params.max_depth > 0 {
        args.push("--max-depth".to_string());
        args.push(filename_search_params.max_depth.to_string());
    }

    if filename_search_params.min_depth > 0 {
        args.push("--min-depth".to_string());
        args.push(filename_search_params.min_depth.to_string());
    }

    // 设置是否包含隐藏文件
    if !filename_search_params.ignore_hidden {
        args.push("--hidden".to_string());
    }

    // 设置忽略规则
    if filename_search_params.no_ignore {
        args.push("--no-ignore".to_string());
    }

    if filename_search_params.no_ignore_vcs {
        args.push("--no-ignore-vcs".to_string());
    }

    // 设置大小写敏感
    if filename_search_params.case_sensitive {
        args.push("--case-sensitive".to_string());
    }

    // 设置符号链接跟随
    if filename_search_params.follow_symlinks {
        args.push("--follow".to_string());
    }

    // 设置文件类型
    for file_type in &filename_search_params.file_types {
        args.push("--type".to_string());
        args.push(file_type.to_string());
    }
    
    // 如果没有指定文件类型，默认搜索文件
    if filename_search_params.file_types.is_empty() {
        args.push("--type".to_string());
        args.push("f".to_string());
    }

    // 设置文件扩展名
    for extension in &filename_search_params.extensions {
        args.push("--extension".to_string());
        args.push(extension.to_string());
    }

    // 设置排除模式
    for pattern in &filename_search_params.exclude_patterns {
        args.push("--exclude".to_string());
        args.push(pattern.to_string());
    }

    // 设置文件大小
    if !filename_search_params.file_size.is_empty() {
        args.push("--size".to_string());
        args.push(filename_search_params.file_size.to_string());
    }

    // 设置修改时间
    if !filename_search_params.changed_within.is_empty() {
        args.push("--changed-within".to_string());
        args.push(filename_search_params.changed_within.to_string());
    }

    if !filename_search_params.changed_before.is_empty() {
        args.push("--changed-before".to_string());
        args.push(filename_search_params.changed_before.to_string());
    }

    // 设置搜索模式
    if filename_search_params.exact_match {
        // 精确匹配：使用 glob 模式
        args.push("--glob".to_string());
    } else {
        // 模糊匹配：使用固定字符串
        args.push("--fixed-strings".to_string());
    }

    args
}

#[tauri::command]
pub async fn search_filename(
    app: AppHandle,
    filename_search_params: FilenameSearchParams,
) -> Result<Vec<SearchResult>, String> {
    // 检测系统是否安装了 fd 工具
    let system_fd_available = check_fd_availability(&app).await?;

    let shell = app.shell();
    let cmd = if system_fd_available {
        println!("使用系统安装的 fd 工具");
        shell.command("fd")
    } else {
        println!("使用 find 工具");
        shell.sidecar("fd").map_err(|e| format!("创建 fd Sidecar 命令失败: {}", e))?
    };

    let args = build_fd_args(&filename_search_params);
    
    // 执行 Sidecar 命令
    let (rx, mut _child) = cmd
        .args(args)
        .spawn()
        .map_err(|e| format!("执行 fd 命令失败: {}", e))?;

    // 收集输出
    let output = parse_output_from_rx(rx).await;

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

    for line in stdout.lines() {
        if line.is_empty() {
            continue;
        }
        if results.len() < MAX_RESULTS {
            results.push(SearchResult {
                file: line.to_string(),
                line: 0,
                column: 0,
                content: String::new(),
                match_text: filename_search_params.pattern.to_string(),
            });
        }
    }

    Ok(results)
}
