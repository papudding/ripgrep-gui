import { Module } from 'vuex';
import type { FileState, RootState } from '../types';

// 导入Tauri fs相关API
import { readTextFile } from '@tauri-apps/plugin-fs';

// 导入非文本文件扩展名列表
import { nonTextFileExtensions } from '../utils/fileTypes';

// 文件相关的状态管理模块
const fileModule: Module<Partial<FileState>, RootState> = {
  namespaced: true,
  state: {
    selectedResult: null,
    fileContent: '',
    isLoadingFile: false
  },
  mutations: {
    setSelectedResult(state: FileState, result: FileState['selectedResult']) {
      state.selectedResult = result;
    },
    setFileContent(state: FileState, content: string) {
      state.fileContent = content;
    },
    setIsLoadingFile(state: FileState, isLoading: boolean) {
      state.isLoadingFile = isLoading;
    }
  },
  actions: {
    async loadFileContent({ commit }: { commit: any }, filePath: string) {
      commit('setIsLoadingFile', true);
      
      try {
        // 检查文件类型，排除非文本文件类型
        
        const fileExtension = filePath.toLowerCase().substring(filePath.lastIndexOf('.'));
        
        if (nonTextFileExtensions.includes(fileExtension)) {
          commit('setFileContent', '该文件暂不支持预览');
          return;
        }
        
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
