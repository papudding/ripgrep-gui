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
export interface ContentSearchOptions {
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
 * 搜索选项类型定义
 * 用于配置搜索行为
 */
export interface FilenameSearchOptions {
  /** 是否忽略大小写 */
  caseInsensitive: boolean;
  /** 是否全字匹配 */
  wholeWord: boolean;
  /** 是否忽略隐藏文件 */
  ignoreHidden: boolean;
  /** 包含的文件类型 */
  includeTypes: string[];
  /** 排除的文件类型 */
  excludeTypes: string[];
  /** 最大搜索深度（0表示无限制） */
  maxDepth: number;
  /** 文件名精确匹配 */
  filenameExactMatch: boolean;
  /** 大小写敏感搜索 */
  caseSensitive: boolean;
  /** 包含被忽略的文件 */
  noIgnore: boolean;
  /** 包含 VCS 忽略的文件 */
  noIgnoreVcs: boolean;
  /** 跟随符号链接 */
  followSymlinks: boolean;
  /** 文件类型过滤 */
  fileTypes: string[];
  /** 文件扩展名过滤 */
  extensions: string[];
  /** 排除模式 */
  excludePatterns: string[];
  /** 最小搜索深度 */
  minDepth: number;
  /** 文件大小过滤 */
  fileSize: string;
  /** 最近修改时间 */
  changedWithin: string;
  /** 之前修改时间 */
  changedBefore: string;
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
  /** 内容搜索选项 */
  contentSearchOptions: ContentSearchOptions;
  /** 文件名搜索选项 */
  filenameSearchOptions: FilenameSearchOptions;
  /** 搜索时间戳 */
  timestamp: number;
}

/**
 * 文件关联类型定义
 * 表示文件扩展名与默认应用的关联
 */
export interface FileAssociation {
  /** 文件扩展名（不含点号） */
  extension: string;
  /** 默认应用程序路径 */
  appPath: string;
}

/**
 * 用户配置类型定义
 * 表示用户基本配置信息
 */
export interface UserConfig {
  /** 是否启用深色模式 */
  darkMode: boolean;
  /** 应用程序语言 */
  language: string;
  /** 文件扩展名与默认应用的关联配置 */
  fileAssociations: FileAssociation[];
}

/**
 * 应用配置类型定义
 * 表示整个应用的配置信息
 */
export interface ConfigState {
  /** 默认搜索路径 */
  defaultSearchPath: string;
  /** 历史记录保存路径 */
  historyPath: string | null;
  /** 用户配置 */
  userConfig: UserConfig;
}

export interface HistoryState {
  /** 搜索历史列表 */
  searchHistory: SearchHistory[];
}

export interface SearchState {
  searchPath: string;
  searchPattern: string;
  contentSearchOptions: ContentSearchOptions;
  filenameSearchOptions: FilenameSearchOptions;
  searchResults: SearchResult[];
  filenameSearchResults: SearchResult[];
  isSearching: boolean;
  searchError: string | null;
}

export interface FileState {
  selectedResult: SearchResult | null;
  fileContent: string;
  isLoadingFile: boolean;
}

/**
 * 应用根状态类型定义
 * 表示整个应用的状态树结构
 */
export interface RootState {
  search: SearchState;
  history: HistoryState
  file: FileState;
  
  /** 当前预览的文件内容 */
  fileContent: string;
  /** 是否正在加载文件内容 */
  isLoadingFile: boolean;
  
  /** 应用配置 */
  config: ConfigState;
}
