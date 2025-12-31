// 使用标准import语法
import { createStore } from 'vuex';

// 定义搜索结果类型
export interface SearchResult {
  file: string;
  line: number;
  column: number;
  content: string;
  match: string;
}

// 定义搜索选项类型
export interface SearchOptions {
  caseInsensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  ignoreHidden: boolean;
  includeTypes: string[];
  excludeTypes: string[];
  maxDepth: number;
}

// 定义搜索历史类型
export interface SearchHistory {
  id: string;
  pattern: string;
  path: string;
  options: SearchOptions;
  timestamp: number;
}

// 定义状态类型
export interface RootState {
  searchPath: string;
  searchPattern: string;
  searchOptions: SearchOptions;
  searchResults: SearchResult[];
  isSearching: boolean;
  searchProgress: number;
  selectedResult: SearchResult | null;
  searchHistory: SearchHistory[];
  isDarkMode: boolean;
  fileContent: string;
  isLoadingFile: boolean;
  searchError: string | null;
  historyPath: string | null;
}

// 导入Tauri fs相关API
import { writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { join, appLocalDataDir } from '@tauri-apps/api/path';

// 历史记录存储文件名
const HISTORY_FILE_NAME = 'search_history.json';

// 历史记录配置
const HISTORY_CONFIG = {
  // 最大历史记录数量
  MAX_HISTORY_COUNT: 100,
  // 历史记录保留天数
  MAX_HISTORY_DAYS: 30,
  // 自动清理间隔（毫秒）
  AUTO_CLEAN_INTERVAL: 24 * 60 * 60 * 1000 // 24小时
};

// 获取历史记录文件的完整路径
async function getHistoryFilePath(state: RootState): Promise<string> {
  // 使用用户设置的历史记录路径，如果未设置则使用应用本地数据目录
  const basePath = state.historyPath || await appLocalDataDir();
  
  try {
    // 检查目录是否存在，不存在则创建
    const dirExists = await exists(basePath);
    if (!dirExists) {
      // 创建目录，递归创建父目录
      await mkdir(basePath, { recursive: true });
      console.log(`历史记录目录已创建: ${basePath}`);
    }
  } catch (error) {
    console.error('创建历史记录目录失败:', error);
    // 目录创建失败时，使用应用本地数据目录作为备用
    const appDataDir = await appLocalDataDir();
    return join(appDataDir, HISTORY_FILE_NAME);
  }
  
  // 生成完整的历史记录文件路径
  return join(basePath, HISTORY_FILE_NAME);
}

// 创建store
export const store = createStore<RootState>({
  state: {
    searchPath: '',
    searchPattern: '',
    searchOptions: {
      caseInsensitive: false,
      wholeWord: false,
      regex: false,
      ignoreHidden: true,
      includeTypes: [],
      excludeTypes: [],
      maxDepth: 0
    },
    searchResults: [],
    isSearching: false,
    searchProgress: 0,
    selectedResult: null,
    searchHistory: [],
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
    fileContent: '',
    isLoadingFile: false,
    searchError: null,
    historyPath: null
  },
  mutations: {
    setSearchPath(state: RootState, path: string) {
      state.searchPath = path;
    },
    setSearchPattern(state: RootState, pattern: string) {
      state.searchPattern = pattern;
    },
    setSearchOptions(state: RootState, options: Partial<SearchOptions>) {
      state.searchOptions = { ...state.searchOptions, ...options };
    },
    setSearchResults(state: RootState, results: SearchResult[]) {
      state.searchResults = results;
    },
    setIsSearching(state: RootState, isSearching: boolean) {
      state.isSearching = isSearching;
    },
    setSearchProgress(state: RootState, progress: number) {
      state.searchProgress = progress;
    },
    setSelectedResult(state: RootState, result: SearchResult | null) {
      state.selectedResult = result;
    },
    addSearchHistory(state: RootState, history: Omit<SearchHistory, 'id' | 'timestamp'>) {
      const newHistory: SearchHistory = {
        ...history,
        id: Date.now().toString(),
        timestamp: Date.now()
      };
      state.searchHistory.unshift(newHistory);
      // 只保留最近100条历史记录
      if (state.searchHistory.length > 100) {
        state.searchHistory = state.searchHistory.slice(0, 100);
      }
    },
    clearSearchHistory(state: RootState) {
      state.searchHistory = [];
    },
    setSearchHistory(state: RootState, history: SearchHistory[]) {
      state.searchHistory = history;
    },
    setDarkMode(state: RootState, isDark: boolean) {
      state.isDarkMode = isDark;
    },
    setFileContent(state: RootState, content: string) {
      state.fileContent = content;
    },
    setIsLoadingFile(state: RootState, isLoading: boolean) {
      state.isLoadingFile = isLoading;
    },
    setSearchError(state: RootState, error: string | null) {
      state.searchError = error;
    },
    setHistoryPath(state: RootState, path: string | null) {
      state.historyPath = path;
    }
  },
  actions: {
    // 保存搜索历史到文件
    async saveSearchHistory({ state }: { state: RootState }) {
      try {
        const historyData = JSON.stringify(state.searchHistory, null, 2);
        const filePath = await getHistoryFilePath(state);
        await writeTextFile(filePath, historyData);
        console.log('搜索历史已保存');
      } catch (error) {
        console.error('保存搜索历史失败:', error);
      }
    },
    
    // 从文件加载搜索历史
    async loadSearchHistory({ commit, state }: { commit: any, state: RootState }) {
      try {
        const filePath = await getHistoryFilePath(state);
        const fileExists = await exists(filePath);
        
        if (fileExists) {
          const historyData = await readTextFile(filePath);
          const history: SearchHistory[] = JSON.parse(historyData);
          commit('setSearchHistory', history);
          console.log('搜索历史已加载');
        } else {
          console.log('搜索历史文件不存在，使用默认值');
        }
      } catch (error) {
        console.error('加载搜索历史失败:', error);
        // 加载失败时使用空数组
        commit('setSearchHistory', []);
      }
    },
    
    // 添加搜索历史并保存
    async addSearchHistory({ commit, dispatch }: { commit: any, dispatch: any }, history: Omit<SearchHistory, 'id' | 'timestamp'>) {
      commit('addSearchHistory', history);
      // 异步保存，不阻塞主线程
      await dispatch('saveSearchHistory');
    },
    
    // 清除搜索历史并保存
    async clearSearchHistory({ commit, dispatch }: { commit: any, dispatch: any }) {
      commit('clearSearchHistory');
      // 异步保存，不阻塞主线程
      await dispatch('saveSearchHistory');
    },
    
    // 设置历史记录保存路径
    async setHistoryPath({ commit, dispatch }: { commit: any, dispatch: any }, path: string | null) {
      try {
        // 如果路径为null或空，直接使用默认路径
        if (!path) {
          commit('setHistoryPath', null);
          await dispatch('saveSearchHistory');
          return { success: true, message: '使用默认历史记录路径' };
        }
        
        // 移除路径前后的空格
        const trimmedPath = path.trim();
        if (!trimmedPath) {
          commit('setHistoryPath', null);
          await dispatch('saveSearchHistory');
          return { success: true, message: '使用默认历史记录路径' };
        }
        
        // 验证路径是否存在
        const pathExists = await exists(trimmedPath);
        if (!pathExists) {
          // 尝试创建目录
          await mkdir(trimmedPath, { recursive: true });
          console.log(`已创建历史记录目录: ${trimmedPath}`);
        }
        
        // 验证是否有写入权限（尝试创建临时文件）
        const tempFile = await join(trimmedPath, '.temp-write-test');
        await writeTextFile(tempFile, 'test');
        await exists(tempFile); // 验证文件是否创建成功
        
        // 设置新路径并保存历史记录
        commit('setHistoryPath', trimmedPath);
        await dispatch('saveSearchHistory');
        
        return { success: true, message: '历史记录路径设置成功' };
      } catch (error) {
        console.error('设置历史记录路径失败:', error);
        return { 
          success: false, 
          message: `设置历史记录路径失败: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
    },
    
    // 自动清理过期或过多的历史记录
    async cleanupSearchHistory({ commit, state, dispatch }: { commit: any, state: RootState, dispatch: any }) {
      try {
        const now = Date.now();
        const maxAge = HISTORY_CONFIG.MAX_HISTORY_DAYS * 24 * 60 * 60 * 1000;
        
        // 过滤掉过期的历史记录
        const filteredByDate = state.searchHistory.filter(history => {
          return now - history.timestamp < maxAge;
        });
        
        // 如果过滤后仍然超过最大数量，只保留最近的记录
        const cleanedHistory = filteredByDate.slice(0, HISTORY_CONFIG.MAX_HISTORY_COUNT);
        
        // 如果历史记录有变化，更新并保存
        if (cleanedHistory.length !== state.searchHistory.length) {
          commit('setSearchHistory', cleanedHistory);
          await dispatch('saveSearchHistory');
          console.log('搜索历史已清理，当前数量:', cleanedHistory.length);
        }
      } catch (error) {
        console.error('清理搜索历史失败:', error);
      }
    },
    
    async performSearch({ commit, state, dispatch }: { commit: any, state: RootState, dispatch: any }) {
      commit('setIsSearching', true);
      commit('setSearchProgress', 0);
      commit('setSearchResults', []);
      commit('setSearchError', null); // 清除之前的搜索错误
      
      try {
        // 导入invoke函数
        const { invoke } = await import('@tauri-apps/api/core');
        
        // 调用Rust搜索命令
        const results = await invoke<any[]>('search', {
          path: state.searchPath,
          pattern: state.searchPattern,
          caseInsensitive: state.searchOptions.caseInsensitive,
          wholeWord: state.searchOptions.wholeWord,
          regex: state.searchOptions.regex,
          ignoreHidden: state.searchOptions.ignoreHidden,
          maxDepth: state.searchOptions.maxDepth
        });
        
        // 转换结果格式
        const formattedResults: SearchResult[] = results.map(result => ({
          file: result.file,
          line: result.line,
          column: result.column,
          content: result.content,
          match: result.match_text
        }));
        
        commit('setSearchResults', formattedResults);
        commit('setSearchProgress', 100);
        
        // 添加到搜索历史前检查是否与所有历史记录重复
        // 重复判断标准：pattern、path和options完全相同
        const newSearchConfig = {
          pattern: state.searchPattern,
          path: state.searchPath,
          options: state.searchOptions
        };
        
        // 优化查询：使用some()方法，找到重复项后立即返回，避免遍历所有记录
        const isDuplicate = state.searchHistory.some(history => {
          return history.pattern === newSearchConfig.pattern &&
                 history.path === newSearchConfig.path &&
                 JSON.stringify(history.options) === JSON.stringify(newSearchConfig.options);
        });
        
        // 添加详细日志记录
        console.log(`历史记录重复检查: ${isDuplicate ? '重复，不添加' : '不重复，添加新记录'}`);
        console.log('检查的搜索配置:', newSearchConfig);
        
        if (!isDuplicate) {
          await dispatch('addSearchHistory', newSearchConfig);
        }
      } catch (error: any) {
        console.error('Search error:', error);
        
        // 设置友好的错误信息
        let errorMessage: string;
        
        if (error && typeof error === 'string') {
          // 如果错误信息已经包含了"搜索失败:"前缀，直接使用，否则添加
          if (error.includes('搜索失败:')) {
            errorMessage = error;
          } else {
            errorMessage = `搜索失败: ${error}`;
          }
        } else if (error && error.message) {
          errorMessage = `搜索失败: ${error.message}`;
        } else {
          errorMessage = '搜索失败: 发生了未知错误';
        }
        
        commit('setSearchError', errorMessage);
        commit('setSearchResults', []); // 确保结果列表为空
        commit('setSearchProgress', 100); // 设置进度为100%
      } finally {
        commit('setIsSearching', false);
      }
    },
    
    async loadFileContent({ commit }: { commit: any }, filePath: string) {
      commit('setIsLoadingFile', true);
      
      try {
        // 读取文件内容
        const content = await readTextFile(filePath);
        
        commit('setFileContent', content);
      } catch (error: any) {
        console.error('Error reading file:', error);
        
        // 改进错误处理，提供更清晰的错误提示
        let errorMessage = 'Error reading file: ';
        
        if (error && typeof error === 'string') {
          if (error.includes('forbidden path')) {
            errorMessage = 'Permission denied: Cannot access this file. Please check the application permissions.';
          } else if (error.includes('not found')) {
            errorMessage = 'File not found: The specified file does not exist.';
          } else {
            errorMessage += error;
          }
        } else {
          errorMessage += 'An unexpected error occurred.';
        }
        
        commit('setFileContent', errorMessage);
      } finally {
        commit('setIsLoadingFile', false);
      }
    }
  },
  getters: {
    filteredSearchResults: (state: RootState) => (filter: string) => {
      if (!filter) return state.searchResults;
      return state.searchResults.filter((result: SearchResult) => 
        result.file.includes(filter) || 
        result.content.includes(filter)
      );
    }
  }
});
