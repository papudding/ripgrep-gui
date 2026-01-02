import { Module } from 'vuex';
import type { RootState, SearchResult } from '../types';

// 搜索相关的状态管理模块
const searchModule: Module<Partial<RootState>, RootState> = {
  namespaced: true,
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
    searchError: null
  },
  mutations: {
    setSearchPath(state, path: string) {
      state.searchPath = path;
    },
    setSearchPattern(state, pattern: string) {
      state.searchPattern = pattern;
    },
    setSearchOptions(state, options: Partial<RootState['searchOptions']>) {
      state.searchOptions = { ...state.searchOptions, ...options };
    },
    setSearchResults(state, results: SearchResult[]) {
      state.searchResults = results;
    },
    setIsSearching(state, isSearching: boolean) {
      state.isSearching = isSearching;
    },
    setSearchProgress(state, progress: number) {
      state.searchProgress = progress;
    },
    setSearchError(state, error: string | null) {
      state.searchError = error;
    }
  },
  actions: {
    async performSearch({ commit, state, dispatch, rootState }) {
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
        console.log(formattedResults);
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
        const isDuplicate = rootState.history.searchHistory.some(history => {
          return history.pattern === newSearchConfig.pattern &&
                 history.path === newSearchConfig.path &&
                 JSON.stringify(history.options) === JSON.stringify(newSearchConfig.options);
        });
        
        if (!isDuplicate) {
          await dispatch('history/addSearchHistory', newSearchConfig, { root: true });
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
    }
  },
  getters: {
    filteredSearchResults: (state) => (filter: string) => {
      if (!filter) return state.searchResults;
      return state.searchResults.filter((result: SearchResult) => 
        result.file.includes(filter) || 
        result.content.includes(filter)
      );
    }
  }
};

export default searchModule;
