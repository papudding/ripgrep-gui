// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use std::str::from_utf8;
// 导入 Tauri Shell 扩展，用于 Sidecar 调用
use crate::entity::{ContentSearchParams, SearchResult};
use crate::util::parse_output_from_rx;
use tauri_plugin_shell::ShellExt;

/// 检测系统是否安装了 rg (ripgrep) 工具
async fn check_rg_availability(app: &tauri::AppHandle) -> Result<bool, String> {
    // 尝试执行 rg --version 命令来检测系统是否安装了 rg 工具
    let shell = app.shell();
    let out_put = shell.command("rg").arg("--version").output().await
        .map_err(|e| format!("执行 rg 命令失败: {}", e))?;

    if out_put.status.success() {
        Ok(true)
    } else {
        Err(format!(
            "命令执行失败, 状态码: {}",
            out_put.status.code().unwrap_or_default()
        ))
    }
}

/// 构建搜索参数
fn build_search_args(
    pattern: &str,
    path: &str,
    case_insensitive: bool,
    whole_word: bool,
    regex: bool,
    ignore_hidden: bool,
    max_depth: u32,
) -> Vec<String> {
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

    args
}

#[tauri::command]
pub async fn search(
    app: tauri::AppHandle,
    content_search_params: ContentSearchParams,
) -> Result<Vec<SearchResult>, String> {
    // 检测系统是否安装了 rg 工具
    let system_rg_available = check_rg_availability(&app).await?;

    // 构建ripgrep命令
    let shell = app.shell();
    let cmd = if system_rg_available {
        println!("使用系统安装的 rg 工具");
        shell.command("rg")
    } else {
        shell
            .sidecar("rg")
            .map_err(|e| format!("创建 rg Sidecar 命令失败: {}", e))?
    };

    // 构建命令参数
    let args = build_search_args(
        &content_search_params.pattern,
        &content_search_params.path,
        content_search_params.case_insensitive,
        content_search_params.whole_word,
        content_search_params.regex,
        content_search_params.ignore_hidden,
        content_search_params.max_depth,
    );

    // 执行 Sidecar 命令
    let (rx, mut _child) = cmd
        .args(args)
        .spawn()
        .map_err(|e| format!("执行内置 rg 命令失败: {}", e))?;

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

    // 设置结果数量上限，防止返回过多数据导致前端卡顿
    const MAX_RESULTS: usize = 10000;

    for line in stdout.lines() {
        // 超过上限则停止解析
        if results.len() >= MAX_RESULTS {
            break;
        }

        // 解析搜索结果
        if let Some(result) = search_result_parse(line, &content_search_params.pattern) {
            results.push(result);
        }
    }

    Ok(results)
}

/// 解析搜索结果行
fn search_result_parse(line: &str, match_text: &str) -> Option<SearchResult> {
    if std::env::consts::OS == "windows" {
        // Windows系统：路径可能包含盘符，如C:\path\to\file，所以分成5段
        let parts: Vec<&str> = line.splitn(5, ':').collect();
        if parts.len() == 5 {
            Some(SearchResult {
                file: format!("{}:{}", parts[0], parts[1]),
                line: parts[2].parse::<u32>().unwrap_or(0),
                column: parts[3].parse::<u32>().unwrap_or(0),
                content: parts[4].to_string(),
                match_text: match_text.to_string(),
            })
        } else {
            None
        }
    } else {
        // 非Windows系统：正常分成4段
        let parts: Vec<&str> = line.splitn(4, ':').collect();
        if parts.len() == 4 {
            Some(SearchResult {
                file: parts[0].to_string(),
                line: parts[1].parse::<u32>().unwrap_or(0),
                column: parts[2].parse::<u32>().unwrap_or(0),
                content: parts[3].to_string(),
                match_text: match_text.to_string(),
            })
        } else {
            None
        }
    }
}
