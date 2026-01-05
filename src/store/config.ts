import { Module } from 'vuex';
import type { RootState, Config } from '../types';
import { saveConfig, loadConfig, validateConfig, mergeConfig } from '../utils/configUtils';

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
     * 从文件加载配置
     */
    async loadConfigFromFile({ commit, state }) {
      try {
        const loadedConfig = await loadConfig(state.config);
        commit('setConfig', loadedConfig);
        return { success: true, message: '配置加载成功' };
      } catch (error) {
        console.error('从文件加载配置失败:', error);
        return { 
          success: false, 
          message: `从文件加载配置失败: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
    },
    
    /**
     * 保存配置到文件
     */
    async saveConfigToFile({ state }) {
      try {
        await saveConfig(state.config);
        return { success: true, message: '配置保存成功' };
      } catch (error) {
        console.error('保存配置到文件失败:', error);
        return { 
          success: false, 
          message: `保存配置到文件失败: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
    },
    
    /**
     * 更新完整配置并保存到文件
     */
    async updateConfig({ commit, state }, newConfig: Partial<Config>) {
      try {
        // 合并新配置和当前配置
        const updatedConfig = mergeConfig(state.config, newConfig);
        
        // 验证配置有效性
        if (!validateConfig(updatedConfig)) {
          throw new Error('配置无效');
        }
        
        // 更新状态
        commit('setConfig', updatedConfig);
        
        // 保存到文件
        await saveConfig(updatedConfig);
        
        // 同时更新 historyPath 到 root state，供历史记录模块使用
        if (newConfig.historyPath !== undefined) {
          commit('setHistoryPath', newConfig.historyPath, { root: true });
        }
        
        return { success: true, message: '配置更新成功' };
      } catch (error) {
        console.error('更新配置失败:', error);
        return { 
          success: false, 
          message: `更新配置失败: ${error instanceof Error ? error.message : String(error)}` 
        };
      }
    },
    
    /**
     * 更新默认搜索路径
     */
    async updateDefaultSearchPath({ commit, dispatch }, path: string) {
      commit('setDefaultSearchPath', path);
      await dispatch('saveConfigToFile');
    },
    
    /**
     * 更新历史记录保存路径
     */
    async updateHistoryPath({ commit, dispatch }, path: string | null) {
      commit('setHistoryPath', path);
      commit('setHistoryPath', path, { root: true }); // 更新 root state 中的 historyPath
      await dispatch('saveConfigToFile');
    },
    
    /**
     * 更新用户配置
     */
    async updateUserConfig({ commit, dispatch }, userConfig: Partial<Config['userConfig']>) {
      commit('updateUserConfig', userConfig);
      await dispatch('saveConfigToFile');
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
