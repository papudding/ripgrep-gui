// 搜索结果结构
#[derive(serde::Serialize)]
pub struct SearchResult {
    pub file: String,
    pub line: u32,
    pub column: u32,
    pub content: String,
    pub match_text: String,
}

