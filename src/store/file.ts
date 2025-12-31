import { Module } from 'vuex';
import type { RootState } from '../types';

// 导入Tauri fs相关API
import { readTextFile } from '@tauri-apps/plugin-fs';

// 文件相关的状态管理模块
const fileModule: Module<Partial<RootState>, RootState> = {
  namespaced: true,
  state: {
    selectedResult: null,
    fileContent: '',
    isLoadingFile: false
  },
  mutations: {
    setSelectedResult(state, result: RootState['selectedResult']) {
      state.selectedResult = result;
    },
    setFileContent(state, content: string) {
      state.fileContent = content;
    },
    setIsLoadingFile(state, isLoading: boolean) {
      state.isLoadingFile = isLoading;
    }
  },
  actions: {
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
  }
};

export default fileModule;
