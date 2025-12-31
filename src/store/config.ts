import { Module } from 'vuex';
import type { RootState, Config } from '../types';

// 配置模块
const configModule: Module<{ config: Config }, RootState> = {
  namespaced: true,
  state: {
    config: {
      defaultSearchPath: '',
      historyPath: null,
      userConfig: {
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        language: navigator.language
      }
    }
  },
  mutations: {
    /**
     * 设置配置
     */
    setConfig(state, config: Config) {
      state.config = config;
    },
    
    /**
     * 更新默认搜索路径
     */
    setDefaultSearchPath(state, path: string) {
      state.config.defaultSearchPath = path;
    },
    
    /**
     * 更新历史记录保存路径
     */
    setHistoryPath(state, path: string | null) {
      state.config.historyPath = path;
    },
    
    /**
     * 更新用户配置
     */
    updateUserConfig(state, userConfig: Partial<Config['userConfig']>) {
      state.config.userConfig = { ...state.config.userConfig, ...userConfig };
    }
  },
  actions: {
    /**
     * 加载配置
     */
    async loadConfig({ commit }, config: Config) {
      commit('setConfig', config);
    },
    
    /**
     * 更新默认搜索路径
     */
    updateDefaultSearchPath({ commit }, path: string) {
      commit('setDefaultSearchPath', path);
    },
    
    /**
     * 更新历史记录保存路径
     */
    updateHistoryPath({ commit }, path: string | null) {
      commit('setHistoryPath', path);
    },
    
    /**
     * 更新用户配置
     */
    updateUserConfig({ commit }, userConfig: Partial<Config['userConfig']>) {
      commit('updateUserConfig', userConfig);
    }
  },
  getters: {
    /**
     * 获取完整配置
     */
    getConfig: (state) => state.config,
    
    /**
     * 获取默认搜索路径
     */
    getDefaultSearchPath: (state) => state.config.defaultSearchPath,
    
    /**
     * 获取历史记录保存路径
     */
    getHistoryPath: (state) => state.config.historyPath,
    
    /**
     * 获取用户配置
     */
    getUserConfig: (state) => state.config.userConfig
  }
};

export default configModule;
