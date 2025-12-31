/**
 * Vuex Store 入口文件
 * 组合各个功能模块，构建完整的状态管理系统
 */

// 使用标准import语法
import { createStore } from 'vuex';
import type { RootState } from '../types';

// 导入功能模块
import searchModule from './search';    // 搜索相关状态管理
import historyModule from './history';  // 历史记录相关状态管理
import fileModule from './file';        // 文件相关状态管理

/**
 * 创建并配置Vuex Store
 * 包含全局状态和各个功能模块
 */
export const store = createStore<RootState>({
  /**
   * 全局状态
   * 包含不适合放在特定模块的共享状态
   */
  state: {
    /** 是否启用深色模式 */
    isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches
  },
  /**
   * 功能模块
   * 将不同领域的状态管理分离到独立模块中
   */
  modules: {
    search: searchModule,    // 搜索相关状态
    history: historyModule,  // 历史记录相关状态
    file: fileModule         // 文件相关状态
  }
});

