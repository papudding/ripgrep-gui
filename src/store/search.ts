import { Module } from 'vuex';
import type { SearchState, RootState, SearchResult } from '../types';

// 搜索相关的状态管理模块
const searchModule: Module<Partial<SearchState>, RootState> = {
  namespaced: true,
  state: {
    searchPath: '',
    searchPattern: '',
    contentSearchOptions: {
      caseInsensitive: false,
      wholeWord: false,
      regex: false,
      ignoreHidden: true,
      includeTypes: [],
      excludeTypes: [],
      maxDepth: 0,
      // 搜索模式相关参数
      fixedStrings: false,
      invertMatch: false,
      lineRegexp: false,
      smartCase: false,
      text: false,
      multiline: false,
      multilineDotall: false,
      pcre2: false,
      // 文件过滤相关参数
      include: [],
      exclude: [],
      fileTypes: [],
      fileTypesNot: [],
      noIgnore: false,
      noIgnoreVcs: false,
      followSymlinks: false,
      // 搜索行为相关参数
      minDepth: 0,
      threads: 0,
      maxCount: 0,
      // 输出相关参数
      lineNumber: true,
      withFilename: true,
      context: 0,
      afterContext: 0,
      beforeContext: 0
    },
    filenameSearchOptions: {
      caseInsensitive: false,
      wholeWord: false,
      regex: false,
      ignoreHidden: true,
      includeTypes: [],
      excludeTypes: [],
      maxDepth: 0,
      filenameExactMatch: false,
      caseSensitive: false,
      noIgnore: false,
      noIgnoreVcs: false,
      followSymlinks: false,
      fileTypes: [],
      extensions: [],
      excludePatterns: [],
      minDepth: 0,
      fileSize: "",
      changedWithin: "",
      changedBefore: ""
    },
    searchResults: [],
    filenameSearchResults: [],
    isSearching: false,
    searchProgress: 0,
    searchError: null
  },
  mutations: {
    setSearchPath(state: SearchState, path: string) {
      state.searchPath = path;
    },
    setSearchPattern(state: SearchState, pattern: string) {
      state.searchPattern = pattern;
    },
    setContentSearchOptions(state: SearchState, options: Partial<SearchState['contentSearchOptions']>) {
      state.contentSearchOptions = { ...state.contentSearchOptions, ...options };
    },
    setFilenameSearchOptions(state: SearchState, options: Partial<SearchState['filenameSearchOptions']>) {
      state.filenameSearchOptions = { ...state.filenameSearchOptions, ...options };
    },
    setSearchResults(state: SearchState, results: SearchResult[]) {
      state.searchResults = results;
    },
    setFilenameSearchResults(state: SearchState, results: SearchResult[]) {
      state.filenameSearchResults = results;
    },
    setIsSearching(state: SearchState, isSearching: boolean) {
      state.isSearching = isSearching;
    },

    setSearchError(state: SearchState, error: string | null) {
      state.searchError = error;
    }
  },
  actions: {
    async performSearch({ commit, state, dispatch, rootState }: {
      commit: any;
      state: SearchState;
      dispatch: any;
      rootState: RootState;
    }) {
      commit('setIsSearching', true);
      commit('setSearchResults', []);
      commit('setFilenameSearchResults', []);
      commit('setSearchError', null); // 清除之前的搜索错误
      
      try {
        // 导入invoke函数
        const { invoke } = await import('@tauri-apps/api/core');
        // 并行执行内容搜索和文件名搜索
        const [contentResults, filenameResults] = await Promise.all([
          // 调用内容搜索命令
          invoke<any[]>('search', {
            contentSearchParams: {
              path: state.searchPath,
              pattern: state.searchPattern,
              case_insensitive: state.contentSearchOptions.caseInsensitive,
              whole_word: state.contentSearchOptions.wholeWord,
              regex: state.contentSearchOptions.regex,
              ignore_hidden: state.contentSearchOptions.ignoreHidden,
              max_depth: state.contentSearchOptions.maxDepth,
              // 搜索模式相关参数
              fixed_strings: state.contentSearchOptions.fixedStrings,
              invert_match: state.contentSearchOptions.invertMatch,
              line_regexp: state.contentSearchOptions.lineRegexp,
              smart_case: state.contentSearchOptions.smartCase,
              text: state.contentSearchOptions.text,
              multiline: state.contentSearchOptions.multiline,
              multiline_dotall: state.contentSearchOptions.multilineDotall,
              pcre2: state.contentSearchOptions.pcre2,
              // 文件过滤相关参数
              include: state.contentSearchOptions.include,
              exclude: state.contentSearchOptions.exclude,
              file_types: state.contentSearchOptions.fileTypes,
              file_types_not: state.contentSearchOptions.fileTypesNot,
              no_ignore: state.contentSearchOptions.noIgnore,
              no_ignore_vcs: state.contentSearchOptions.noIgnoreVcs,
              follow_symlinks: state.contentSearchOptions.followSymlinks,
              // 搜索行为相关参数
              min_depth: state.contentSearchOptions.minDepth,
              threads: state.contentSearchOptions.threads,
              max_count: state.contentSearchOptions.maxCount,
              // 输出相关参数
              line_number: state.contentSearchOptions.lineNumber,
              with_filename: state.contentSearchOptions.withFilename,
              context: state.contentSearchOptions.context,
              after_context: state.contentSearchOptions.afterContext,
              before_context: state.contentSearchOptions.beforeContext
            }
          }),
          // 调用文件名搜索命令
          invoke<any[]>('search_filename', {
            filenameSearchParams: {
              path: state.searchPath,
              pattern: state.searchPattern,
              exact_match: state.filenameSearchOptions.filenameExactMatch,
              ignore_hidden: state.filenameSearchOptions.ignoreHidden,
              max_depth: state.filenameSearchOptions.maxDepth,
              case_sensitive: state.filenameSearchOptions.caseSensitive,
              no_ignore: state.filenameSearchOptions.noIgnore,
              no_ignore_vcs: state.filenameSearchOptions.noIgnoreVcs,
              follow_symlinks: state.filenameSearchOptions.followSymlinks,
              file_types: state.filenameSearchOptions.fileTypes,
              extensions: state.filenameSearchOptions.extensions,
              exclude_patterns: state.filenameSearchOptions.excludePatterns,
              min_depth: state.filenameSearchOptions.minDepth,
              file_size: state.filenameSearchOptions.fileSize,
              changed_within: state.filenameSearchOptions.changedWithin,
              changed_before: state.filenameSearchOptions.changedBefore
            }
          })
        ]);
        
        // 转换内容搜索结果格式
        const formattedContentResults: SearchResult[] = contentResults.map(result => ({
          file: result.file,
          line: result.line,
          column: result.column,
          content: result.content,
          match: result.match_text
        }));
        
        // 转换文件名搜索结果格式
        const formattedFilenameResults: SearchResult[] = filenameResults.map(result => ({
          file: result.file,
          line: result.line,
          column: result.column,
          content: result.content,
          match: result.match_text
        }));
        
        // 存储结果
        commit('setSearchResults', formattedContentResults);
        commit('setFilenameSearchResults', formattedFilenameResults);
        
        // 添加到搜索历史前检查是否与所有历史记录重复
        // 重复判断标准：pattern、path和options完全相同
        // 注意：这里需要创建options的深拷贝，避免历史记录受后续选项修改的影响
        const newSearchConfig = {
          pattern: state.searchPattern,
          path: state.searchPath,
          contentSearchOptions: JSON.parse(JSON.stringify(state.contentSearchOptions)),
          filenameSearchOptions: JSON.parse(JSON.stringify(state.filenameSearchOptions))
        };
        
        // 优化查询：使用some()方法，找到重复项后立即返回，避免遍历所有记录
        const isDuplicate = rootState.history.searchHistory.some(history => {
          return history.pattern === newSearchConfig.pattern &&
                 history.path === newSearchConfig.path &&
                 JSON.stringify(history.contentSearchOptions) === JSON.stringify(newSearchConfig.contentSearchOptions) &&
                 JSON.stringify(history.filenameSearchOptions) === JSON.stringify(newSearchConfig.filenameSearchOptions);
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
        commit('setSearchResults', []); // 确保内容搜索结果列表为空
        commit('setFilenameSearchResults', []); // 确保文件名搜索结果列表为空
      } finally {
        commit('setIsSearching', false);
      }
    }
  },
  getters: {
    filteredSearchResults: (state: SearchState) => (filter: string) => {
      if (!filter) return state.searchResults;
      return state.searchResults.filter((result: SearchResult) => 
        result.file.includes(filter) || 
        result.content.includes(filter)
      );
    }
  }
};

export default searchModule;
