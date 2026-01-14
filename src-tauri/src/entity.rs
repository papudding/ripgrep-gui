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