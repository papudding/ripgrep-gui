/**
 * 搜索结果类型定义
 * 表示单个搜索匹配结果
 */
export interface SearchResult {
  /** 匹配的文件路径 */
  file: string;
  /** 匹配的行号 */
  line: number;
  /** 匹配的列号 */
  column: number;
  /** 匹配的行内容 */
  content: string;
  /** 匹配的文本 */
  match: string;
}

/**
 * 搜索选项类型定义
 * 用于配置搜索行为
 */
export interface SearchOptions {
  /** 是否忽略大小写 */
  caseInsensitive: boolean;
  /** 是否全字匹配 */
  wholeWord: boolean;
  /** 是否使用正则表达式 */
  regex: boolean;
  /** 是否忽略隐藏文件 */
  ignoreHidden: boolean;
  /** 包含的文件类型 */
  includeTypes: string[];
  /** 排除的文件类型 */
  excludeTypes: string[];
  /** 最大搜索深度（0表示无限制） */
  maxDepth: number;
}

/**
 * 搜索历史类型定义
 * 表示一次搜索的历史记录
 */
export interface SearchHistory {
  /** 唯一标识符 */
  id: string;
  /** 搜索模式 */
  pattern: string;
  /** 搜索路径 */
  path: string;
  /** 搜索选项 */
  options: SearchOptions;
  /** 搜索时间戳 */
  timestamp: number;
}

/**
 * 应用根状态类型定义
 * 表示整个应用的状态树结构
 */
export interface RootState {
  /** 当前搜索路径 */
  searchPath: string;
  /** 当前搜索模式 */
  searchPattern: string;
  /** 当前搜索选项 */
  searchOptions: SearchOptions;
  /** 当前搜索结果列表 */
  searchResults: SearchResult[];
  /** 是否正在搜索 */
  isSearching: boolean;
  /** 搜索进度（0-100） */
  searchProgress: number;
  /** 当前选中的搜索结果 */
  selectedResult: SearchResult | null;
  /** 搜索历史列表 */
  searchHistory: SearchHistory[];
  /** 是否启用深色模式 */
  isDarkMode: boolean;
  /** 当前预览的文件内容 */
  fileContent: string;
  /** 是否正在加载文件内容 */
  isLoadingFile: boolean;
  /** 搜索错误信息 */
  searchError: string | null;
  /** 历史记录保存路径 */
  historyPath: string | null;
}
