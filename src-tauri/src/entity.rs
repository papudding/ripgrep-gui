use serde::{Deserialize, Serialize};
// 搜索结果结构
#[derive(Serialize, Deserialize)]
pub struct SearchResult {
    pub file: String,
    pub line: u32,
    pub column: u32,
    pub content: String,
    pub match_text: String,
}
#[derive(Serialize, Deserialize)]
pub struct ContentSearchParams {
    pub pattern: String,
    pub path: String,
    pub case_insensitive: bool,
    pub whole_word: bool,
    pub regex: bool,
    pub ignore_hidden: bool,
    pub max_depth: u32,
    // 搜索模式相关参数
    pub fixed_strings: bool,
    pub invert_match: bool,
    pub line_regexp: bool,
    pub smart_case: bool,
    pub text: bool,
    pub multiline: bool,
    pub multiline_dotall: bool,
    pub pcre2: bool,
    // 文件过滤相关参数
    pub include: Vec<String>,
    pub exclude: Vec<String>,
    pub file_types: Vec<String>,
    pub file_types_not: Vec<String>,
    pub no_ignore: bool,
    pub no_ignore_vcs: bool,
    pub follow_symlinks: bool,
    // 搜索行为相关参数
    pub min_depth: u32,
    pub threads: u32,
    pub max_count: u32,
    // 输出相关参数
    pub line_number: bool,
    pub with_filename: bool,
    pub context: u32,
    pub after_context: u32,
    pub before_context: u32,
}
#[derive(Serialize, Deserialize)]
pub struct FilenameSearchParams {
    pub pattern: String,
    pub path: String,
    pub exact_match: bool,
    pub ignore_hidden: bool,
    pub max_depth: u32,
    pub case_sensitive: bool,
    pub no_ignore: bool,
    pub no_ignore_vcs: bool,
    pub follow_symlinks: bool,
    pub file_types: Vec<String>,
    pub extensions: Vec<String>,
    pub exclude_patterns: Vec<String>,
    pub min_depth: u32,
    pub file_size: String,
    pub changed_within: String,
    pub changed_before: String,
}