// 搜索结果结构
#[derive(serde::Serialize)]
pub struct SearchResult {
    pub file: String,
    pub line: u32,
    pub column: u32,
    pub content: String,
    pub match_text: String,
}
#[derive(serde::Serialize, serde::Deserialize)]
pub struct ContentSearchParams {
    pub pattern: String,
    pub path: String,
    pub case_insensitive: bool,
    pub whole_word: bool,
    pub regex: bool,
    pub ignore_hidden: bool,
    pub max_depth: u32,
}