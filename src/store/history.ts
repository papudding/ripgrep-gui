import { Module } from 'vuex';
import type { RootState, SearchHistory } from '../types';

// 导入Tauri fs相关API
import { writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { join, homeDir } from '@tauri-apps/api/path';

// 配置文件存储目录名
const CONFIG_DIR_NAME = '.config';
const APP_CONFIG_DIR_NAME = 'ripgrep-gui';

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
  try {
    // 使用用户设置的历史记录路径，如果未设置则使用默认路径
    let basePath;
    if (state.historyPath) {
      basePath = state.historyPath;
    } else {
      // 获取用户目录
      const userHomeDir = await homeDir();
      // 构建默认的历史记录目录路径 (~/.config/ripgrep-gui)
      basePath = join(userHomeDir, CONFIG_DIR_NAME, APP_CONFIG_DIR_NAME);
    }
    
    // 检查目录是否存在，不存在则创建
    const dirExists = await exists(basePath);
    if (!dirExists) {
      // 创建目录，递归创建父目录
      await mkdir(basePath, { recursive: true });
    }
    
    // 生成完整的历史记录文件路径
    return join(basePath, HISTORY_FILE_NAME);
  } catch (error) {
    console.error('获取历史记录文件路径失败:', error);
    // 失败时使用当前目录作为备用
    return HISTORY_FILE_NAME;
  }
}

// 历史记录相关的状态管理模块
const historyModule: Module<Partial<RootState>, RootState> = {
  namespaced: true,
  state: {
    searchHistory: [],
    historyPath: null
  },
  mutations: {
    addSearchHistory(state, history: Omit<SearchHistory, 'id' | 'timestamp'>) {
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
    clearSearchHistory(state) {
      state.searchHistory = [];
    },
    setSearchHistory(state, history: SearchHistory[]) {
      state.searchHistory = history;
    },
    setHistoryPath(state, path: string | null) {
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
        } else {
          console.warn('搜索历史文件不存在，使用默认值');
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
    }
  }
};

export default historyModule;
