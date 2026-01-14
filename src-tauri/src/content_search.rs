// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
use log::{debug, error, info, warn};
use std::str::from_utf8;
// 导入 Tauri Shell 扩展，用于 Sidecar 调用
use crate::entity::{ContentSearchParams, SearchResult};
use crate::util::parse_output_from_rx;
use tauri_plugin_shell::ShellExt;

/// 检测系统是否安装了 rg (ripgrep) 工具
async fn check_rg_availability(app: &tauri::AppHandle) -> Result<bool, String> {
    // 尝试执行 rg --version 命令来检测系统是否安装了 rg 工具
    let shell = app.shell();
    let out_put = shell
        .command("rg")
        .arg("--version")
        .output()
        .await
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
    content_search_params: &ContentSearchParams,
) -> Vec<String> {
    let mut args = Vec::new();

    // 添加搜索选项
    // 搜索模式相关参数
    if content_search_params.fixed_strings {
        args.push("-F".to_string());
    }

    if content_search_params.invert_match {
        args.push("-v".to_string());
    }

    if content_search_params.line_regexp {
        args.push("-x".to_string());
    }

    if content_search_params.smart_case {
        args.push("-S".to_string());
    }

    if content_search_params.text {
        args.push("-a".to_string());
    }

    if content_search_params.multiline {
        args.push("-U".to_string());
    }

    if content_search_params.multiline_dotall {
        args.push("--multiline-dotall".to_string());
    }

    if content_search_params.pcre2 {
        args.push("-P".to_string());
    }

    if content_search_params.case_insensitive {
        args.push("-i".to_string());
    }

    if content_search_params.whole_word {
        args.push("-w".to_string());
    }

    // 文件过滤相关参数
    for pattern in &content_search_params.include {
        args.push("--include".to_string());
        args.push(pattern.to_string());
    }

    for pattern in &content_search_params.exclude {
        args.push("--exclude".to_string());
        args.push(pattern.to_string());
    }

    for type_name in &content_search_params.file_types {
        args.push("--type".to_string());
        args.push(type_name.to_string());
    }

    for type_name in &content_search_params.file_types_not {
        args.push("--type-not".to_string());
        args.push(type_name.to_string());
    }

    if content_search_params.no_ignore {
        args.push("--no-ignore".to_string());
    }

    if content_search_params.no_ignore_vcs {
        args.push("--no-ignore-vcs".to_string());
    }

    if content_search_params.follow_symlinks {
        args.push("-L".to_string());
    }

    // 搜索行为相关参数
    if content_search_params.min_depth > 0 {
        args.push(format!("--min-depth={}", content_search_params.min_depth));
    }

    if content_search_params.max_depth > 0 {
        args.push(format!("--max-depth={}", content_search_params.max_depth));
    }

    if content_search_params.threads > 0 {
        args.push(format!("-j{}", content_search_params.threads));
    }

    if content_search_params.max_count > 0 {
        args.push(format!("-m{}", content_search_params.max_count));
    }

    // 输出相关参数
    if content_search_params.line_number {
        args.push("-n".to_string());
    }

    if content_search_params.with_filename {
        args.push("-H".to_string());
    }

    if content_search_params.context > 0 {
        args.push(format!("-C{}", content_search_params.context));
    }

    if content_search_params.after_context > 0 {
        args.push(format!("-A{}", content_search_params.after_context));
    }

    if content_search_params.before_context > 0 {
        args.push(format!("-B{}", content_search_params.before_context));
    }

    if !content_search_params.ignore_hidden {
        args.push("--hidden".to_string());
    }

    // 添加搜索模式
    if content_search_params.regex {
        args.push("-e".to_string());
        args.push(content_search_params.pattern.to_string());
    } else {
        args.push(content_search_params.pattern.to_string());
    }

    // 添加搜索路径
    args.push(content_search_params.path.to_string());

    // 设置输出格式: 文件路径:行号:列号:内容
    args.push("--vimgrep".to_string());

    args
}

#[tauri::command]
pub async fn search(
    app: tauri::AppHandle,
    content_search_params: ContentSearchParams,
) -> Result<Vec<SearchResult>, String> {
    info!("开始内容搜索 - 模式: {}, 路径: {}", content_search_params.pattern, content_search_params.path);
    
    // 检测系统是否安装了 rg 工具
    let system_rg_available = check_rg_availability(&app).await?;
    debug!("系统 rg 工具可用: {}", system_rg_available);

    // 构建ripgrep命令
    let shell = app.shell();
    let cmd = if system_rg_available {
        debug!("使用系统安装的 rg 工具");
        shell.command("rg")
    } else {
        debug!("使用内置 rg sidecar");
        shell
            .sidecar("rg")
            .map_err(|e| format!("创建 rg Sidecar 命令失败: {}", e))?
    };

    // 构建命令参数
    let args = build_search_args(&content_search_params);
    debug!("rg 命令参数: {:?}", args);

    // 执行 Sidecar 命令
    let (rx, mut _child) = cmd
        .args(args)
        .spawn()
        .map_err(|e| format!("执行 rg 命令失败: {}", e))?;

    // 收集输出
    let output = parse_output_from_rx(rx).await;

    // 检查命令是否成功执行
    // ripgrep在没有找到结果时返回非零状态码，这是正常行为，不是错误
    let stderr = from_utf8(&output.stderr).unwrap_or("无法解析错误信息");
    if !output.status.success() {
        // 只有当stderr有内容时才视为真正的错误
        // 否则，只是没有找到结果，返回空数组
        if !stderr.is_empty() {
            error!("rg 命令执行出错: {}", stderr);
            return Err(format!("{}", stderr));
        }
        warn!("rg 命令未找到匹配结果");
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
            warn!("搜索结果达到上限 {}，停止解析", MAX_RESULTS);
            break;
        }

        // 解析搜索结果
        if let Some(result) = search_result_parse(line, &content_search_params.pattern) {
            results.push(result);
        }
    }

    info!("内容搜索完成 - 找到 {} 个结果", results.len());
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
