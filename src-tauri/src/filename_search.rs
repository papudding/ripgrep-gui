use crate::entity::SearchResult;

#[tauri::command]
pub async fn search_filename(
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
