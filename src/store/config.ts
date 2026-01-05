import { Module } from 'vuex';
import type { RootState, ConfigState } from '../types';
import { saveConfig, loadConfig, validateConfig, mergeConfig } from '../utils/configUtils';

// 配置模块
const configModule: Module<{ config: ConfigState }, RootState> = {
  namespaced: true,
  state: {
    defaultSearchPath: '',
    historyPath: null,
    userConfig: {
      darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      language: navigator.language
    }
  },
  mutations: {
    /**
     * 设置配置
     */
    setConfig(state: ConfigState, config: ConfigState) {
      // 逐个属性更新，确保状态响应式
      state.defaultSearchPath = config.defaultSearchPath;
      state.historyPath = config.historyPath;
      state.userConfig = config.userConfig;
    },
    
    /**
     * 更新默认搜索路径
     */
    setDefaultSearchPath(state, path: string) {
      state.defaultSearchPath = path;
    },
    
    /**
     * 更新历史记录保存路径
     */
    setHistoryPath(state: ConfigState, path: string | null) {
      state.historyPath = path;
    },
    
    /**
     * 更新用户配置
     */
    updateUserConfig(state: ConfigState, userConfig: Partial<ConfigState['userConfig']>) {
      state.userConfig = { ...state.userConfig, ...userConfig };
    }
  },
  actions: {
    /**
     * 从文件加载配置
     */
    async loadConfigFromFile({ commit, state }) {
      try {
        const loadedConfig = await loadConfig(state);
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
        await saveConfig(state);
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
    async updateConfig({ commit, state }, newConfig: Partial<ConfigState>) {
      try {
        // 合并新配置和当前配置
        const updatedConfig = mergeConfig(state, newConfig);
        
        // 验证配置有效性
        if (!validateConfig(updatedConfig)) {
          throw new Error('配置无效');
        }
        
        // 更新状态
        commit('setConfig', updatedConfig);
        
        // 保存到文件
        await saveConfig(updatedConfig);
        
  
        
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
      await dispatch('saveConfigToFile');
    },
    
    /**
     * 更新用户配置
     */
    async updateUserConfig({ commit, dispatch }, userConfig: Partial<ConfigState['userConfig']>) {
      commit('updateUserConfig', userConfig);
      await dispatch('saveConfigToFile');
    }
  },
  getters: {
    /**
     * 获取完整配置
     */
    getConfig: (state: ConfigState) => state,
    
    /**
     * 获取默认搜索路径
     */
    getDefaultSearchPath: (state: ConfigState) => state.defaultSearchPath,
    
    /**
     * 获取历史记录保存路径
     */
    getHistoryPath: (state: ConfigState) => state.historyPath,
    
    /**
     * 获取用户配置
     */
    getUserConfig: (state: ConfigState) => state.userConfig
  }
};

export default configModule;
