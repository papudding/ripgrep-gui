<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from 'vuex';
import type { SearchResult } from '../types';
import { highlightMatch } from '../utils/highlight';
import Pagination from './Pagination.vue';
import { openPath } from '@tauri-apps/plugin-opener';
import { platform } from '@tauri-apps/plugin-os';

const store = useStore();

// 结果筛选和排序
const resultFilter = ref("");
const sortBy = ref("file"); // file, line, match
const sortOrder = ref("asc"); // asc, desc

// 分页配置
const PAGE_SIZE = 100;
const currentPage = ref(1);

// 页签切换
const activeTab = ref("content"); // content, filename

// 加载状态管理
const loadingFiles = ref<Record<string, boolean>>({});
const errorMessages = ref<Record<string, string>>({});

// 计算属性
const isSearching = computed(() => store.state.search.isSearching);
const searchError = computed(() => store.state.search.searchError);
const selectedResult = computed(() => store.state.file.selectedResult);

// 内容搜索筛选后的结果
const filteredContentResults = computed(() => {
  let results = store.getters['search/filteredSearchResults'](resultFilter.value);
  
  // 排序
  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy.value) {
      case 'file':
        comparison = a.file.localeCompare(b.file);
        break;
      case 'line':
        comparison = a.line - b.line;
        break;
      case 'match':
        comparison = a.match.localeCompare(b.match);
        break;
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  
  return sortedResults;
});

// 文件名搜索筛选后的结果
const filteredFilenameResults = computed(() => {
  let results = store.state.search.filenameSearchResults;
  
  // 应用筛选
  if (resultFilter.value) {
    const filter = resultFilter.value.toLowerCase();
    results = results.filter(result => result.file.toLowerCase().includes(filter));
  }
  
  // 排序
  const sortedResults = [...results].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy.value) {
      case 'file':
        comparison = a.file.localeCompare(b.file);
        break;
      case 'match':
        comparison = a.match.localeCompare(b.match);
        break;
      case 'line':
        comparison = a.line - b.line;
        break;
    }
    
    return sortOrder.value === 'asc' ? comparison : -comparison;
  });
  
  return sortedResults;
});

// 当前页签筛选后的结果
const filteredResults = computed(() => {
  // 重置分页
  resetPagination();
  
  return activeTab.value === 'content' ? filteredContentResults.value : filteredFilenameResults.value;
});

// 总页数
const totalPages = computed(() => {
  const totalResults = filteredResults.value.length;
  return Math.ceil(totalResults / PAGE_SIZE);
});

// 分页后的结果
const paginatedResults = computed(() => {
  const start = (currentPage.value - 1) * PAGE_SIZE;
  const end = start + PAGE_SIZE;
  return filteredResults.value.slice(start, end);
});

// 切换排序
function toggleSort(newSortBy: string) {
  if (sortBy.value === newSortBy) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = newSortBy;
    sortOrder.value = 'asc';
  }
}

// 重置分页
function resetPagination() {
  currentPage.value = 1;
}

// 选择搜索结果
async function selectResult(result: SearchResult) {
  store.commit('file/setSelectedResult', result);
  await store.dispatch('file/loadFileContent', result.file);
}

// 切换到指定页
function goToPage(page: number) {
  currentPage.value = page;
}

// 加载更多结果
function loadMoreResults() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// 检查文件是否有匹配的关联应用
function hasMatchingAssociation(filePath: string): boolean {
  const fileExtension = filePath.split('.').pop()?.toLowerCase();
  const fileAssociations = store.state.config.userConfig.fileAssociations;
  
  if (fileExtension) {
    const matchingAssociation = fileAssociations.find((assoc: { extension: string; }) => 
      assoc.extension.toLowerCase() === fileExtension
    );
    return !!matchingAssociation;
  }
  
  return false;
}

// 打开文件
async function openFile(result: SearchResult, event: MouseEvent) {
  // 阻止事件冒泡，避免触发选择结果的操作
  event.stopPropagation();
  
  const filePath = result.file;
  
  // 清除之前的错误信息
  delete errorMessages.value[filePath];
  
  // 设置加载状态
  loadingFiles.value[filePath] = true;
  
  try {
    // 获取文件扩展名
    const fileExtension = filePath.split('.').pop()?.toLowerCase();
    
    // 从store获取文件关联配置
    const fileAssociations = store.state.config.userConfig.fileAssociations;
    
    // 查找匹配的文件关联
    let tool: string | undefined;
    if (fileExtension) {
      const matchingAssociation = fileAssociations.find((assoc: { extension: string; }) => 
        assoc.extension.toLowerCase() === fileExtension
      );
      if (matchingAssociation) {
        tool = matchingAssociation.appPath;
      }
    }
    
    // 根据是否找到匹配的工具来打开文件
    if (tool) {
      // 动态导入invoke函数
      const { invoke } = await import('@tauri-apps/api/core');
      // 使用新的Tauri命令打开文件
      await invoke('open_file_with_app', {
        filePath: filePath,
        app: tool
      });
    } else {
      // 如果没有找到匹配的工具，使用默认方式打开
      await openPath(filePath);
    }
  } catch (error) {
    console.error('Failed to open file:', error);
    errorMessages.value[filePath] = `打开文件失败: ${error instanceof Error ? error.message : String(error)}`;
    
    // 3秒后清除错误信息
    setTimeout(() => {
      delete errorMessages.value[filePath];
    }, 3000);
  } finally {
    // 清除加载状态
    loadingFiles.value[filePath] = false;
  }
}

// 在文件系统中打开文件或文件夹
async function openInFileSystem(result: SearchResult, event: MouseEvent) {
  // 阻止事件冒泡，避免触发选择结果的操作
  event.stopPropagation();
  
  const filePath = result.file;
  
  // 清除之前的错误信息
  delete errorMessages.value[filePath];
  
  // 设置加载状态
  loadingFiles.value[filePath] = true;
  
  try {
    // 获取当前操作系统平台
    const currentPlatform = await platform();
    
    // 根据平台获取文件路径的上级目录
    let directoryPath: string;
    if (currentPlatform === 'windows') {
      // Windows 系统使用反斜杠作为路径分隔符
      const lastSlashIndex = filePath.lastIndexOf('\\');
      directoryPath = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : filePath;
    } else {
      // macOS 和 Linux 系统使用正斜杠作为路径分隔符
      const lastSlashIndex = filePath.lastIndexOf('/');
      directoryPath = lastSlashIndex !== -1 ? filePath.substring(0, lastSlashIndex) : filePath;
    }
    
    // 使用 Tauri 的 openPath API 在文件系统中打开目录
    await openPath(directoryPath);
  } catch (error) {
    console.error('Failed to open in file system:', error);
    errorMessages.value[filePath] = `在文件系统中打开失败: ${error instanceof Error ? error.message : String(error)}`;
    
    // 3秒后清除错误信息
    setTimeout(() => {
      delete errorMessages.value[filePath];
    }, 3000);
  } finally {
    // 清除加载状态
    loadingFiles.value[filePath] = false;
  }
}
</script>

<template>
  <div class="search-results">
    <div class="results-header">
      <!-- 页签切换 -->
      <div class="results-tabs">
        <button 
          @click="activeTab = 'content'"
          class="tab-btn"
          :class="{ active: activeTab === 'content' }"
          :data-count="filteredContentResults.length"
        >
          内容匹配
        </button>
        <button 
          @click="activeTab = 'filename'"
          class="tab-btn"
          :class="{ active: activeTab === 'filename' }"
          :data-count="filteredFilenameResults.length"
        >
          文件名匹配
        </button>
      </div>
      
      <div class="results-header-top">
        <h2>搜索结果 ({{ filteredResults.length }})</h2>
        
        <!-- 结果筛选 -->
        <div class="results-filter">
          <input
            v-model="resultFilter"
            type="text"
            placeholder="筛选结果..."
            class="filter-input"
          />
        </div>
      </div>
      
      <!-- 结果排序 -->
      <div class="results-sort">
        <span class="sort-label">排序:</span>
        <button 
          @click="toggleSort('file')"
          class="sort-btn"
          :class="{ active: sortBy === 'file' }"
        >
          文件 {{ sortBy === 'file' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button 
          @click="toggleSort('line')"
          class="sort-btn"
          :class="{ active: sortBy === 'line' }"
        >
          行号 {{ sortBy === 'line' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
        <button 
          @click="toggleSort('match')"
          class="sort-btn"
          :class="{ active: sortBy === 'match' }"
        >
          匹配 {{ sortBy === 'match' ? (sortOrder === 'asc' ? '↑' : '↓') : '' }}
        </button>
      </div>
    </div>
    
    <div class="results-list">
      <div 
          v-for="(result, index) in paginatedResults" 
          :key="index"
          class="result-item"
          :class="{ 'selected': selectedResult === result }"
          @click="selectResult(result)"
        >
          <div class="result-item-content">
            <div class="result-file">{{ result.file }}</div>
            <div v-if="activeTab === 'content'" class="result-line">{{ result.line }}:{{ result.column }}</div>
            <div v-else class="result-line">文件名匹配</div>
            <div 
              v-if="activeTab === 'content'" 
              class="result-content" 
              v-html="highlightMatch(result.content, result.match)"
            ></div>
          </div>
          <div class="result-item-actions">
            <button 
              v-if="hasMatchingAssociation(result.file)"
              @click="openFile(result, $event)"
              class="open-file-btn"
              :disabled="loadingFiles[result.file]"
              :class="{ 'loading': loadingFiles[result.file] }"
              title="使用app打开"
            >
              <span v-if="!loadingFiles[result.file]">
                <img src="/app.svg" alt="打开" class="open-icon" />
              </span>
              <span v-else>⏳</span>
            </button>
            <button 
              @click="openInFileSystem(result, $event)"
              class="open-file-btn"
              :disabled="loadingFiles[result.file]"
              :class="{ 'loading': loadingFiles[result.file] }"
              title="在文件系统中打开"
            >
              <span v-if="!loadingFiles[result.file]">
                <img src="/folder.svg" alt="文件系统打开" class="open-icon" />
              </span>
              <span v-else>⏳</span>
            </button>
          </div>
          <div v-if="errorMessages[result.file]" class="error-message">
            {{ errorMessages[result.file] }}
          </div>
        </div>
      
      <div v-if="searchError" class="search-error">
        <p>{{ searchError }}</p>
      </div>
      
      <div v-else-if="filteredResults.length === 0 && !isSearching" class="no-results">
        <div class="no-results-content">
          <h3>{{ resultFilter ? '没有匹配的筛选结果' : '未找到匹配结果' }}</h3>
          <p v-if="!resultFilter" class="no-results-suggestions">
            尝试以下建议：<br>
            • 检查搜索关键词是否正确<br>
            • 调整搜索选项（如忽略大小写）<br>
            • 放宽搜索条件（如减少搜索深度）<br>
            • 尝试不同的关键词或搜索模式
          </p>
          <p v-else class="no-results-suggestions">
            尝试调整筛选条件或使用更宽泛的关键词
          </p>
        </div>
      </div>
      
      <div v-if="isSearching" class="searching-indicator">
        <p>正在搜索...</p>
      </div>
      
      <!-- 分页控件 -->
      <Pagination
        v-if="filteredResults.length > 0 && !isSearching"
        :current-page="currentPage"
        :total-pages="totalPages"
        :total-results="filteredResults.length"
        :page-size="PAGE_SIZE"
        @go-to-page="goToPage"
        @load-more="loadMoreResults"
      />
    </div>
  </div>
</template>

<style scoped>
/* 搜索结果区域 */
.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
  transition: background-color 0.2s ease;
}

.results-header {
  padding: 10px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: all 0.2s ease;
}

/* 结果页签 */
.results-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.tab-btn {
  padding: 7px 14px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  position: relative;
  overflow: hidden;
}

.tab-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.03);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.tab-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.tab-btn:hover::before {
  opacity: 1;
}

.tab-btn.active {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(57, 108, 216, 0.3);
}

.tab-btn.active::before {
  background-color: rgba(255, 255, 255, 0.15);
  opacity: 1;
}

/* 页签按钮中的计数样式 */
.tab-btn::after {
  content: attr(data-count);
  display: inline-block;
  margin-left: 6px;
  font-size: 12px;
  font-weight: 600;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 2px 6px;
  border-radius: 10px;
  min-width: 20px;
  text-align: center;
}

.results-header-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

.results-header h2 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

/* 结果筛选 */
.results-filter {
  display: flex;
  align-items: center;
}

.filter-input {
  padding: 6px 10px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  width: 200px;
  transition: all 0.2s ease;
}

.filter-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
}

/* 结果排序 */
.results-sort {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sort-label {
  font-size: 13px;
  color: var(--text-secondary);
}

.sort-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 4px;
}

.sort-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-color);
  color: var(--text-primary);
}

.sort-btn.active {
  background-color: var(--accent-light);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.results-list {
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.result-item {
  padding: 10px 12px;
  margin-bottom: 6px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  position: relative;
  overflow: hidden;
}

.result-item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item-actions {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}

.result-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 4px;
  height: 100%;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.result-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.result-item.selected {
  background-color: var(--accent-light);
  border-color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(57, 108, 216, 0.2);
}

.result-item.selected::before {
  background-color: var(--accent-color);
}

.result-file {
  font-size: 14px;
  font-weight: 500;
  color: var(--accent-color);
}

.result-line {
  font-size: 12px;
  color: var(--text-muted);
  font-family: monospace;
}

.result-content {
  font-size: 13px;
  color: var(--text-primary);
  white-space: pre-wrap;
  word-break: break-all;
}

/* 打开文件按钮样式 */
.open-file-btn {
  padding: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}


/* 打开图标样式 */
.open-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.open-file-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  box-shadow: 0 2px 8px rgba(57, 108, 216, 0.3);
  transform: scale(1.05);
}

.open-file-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.open-file-btn.loading {
  background-color: var(--accent-light);
}

/* 错误信息样式 */
.error-message {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
  padding: 4px 8px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 4px;
  width: 100%;
}

.no-results,
.searching-indicator {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--text-secondary);
  font-size: 14px;
}

.no-results {
  background-color: rgba(57, 108, 216, 0.05);
  border: 1px solid rgba(57, 108, 216, 0.2);
  border-radius: 8px;
  margin: 8px 0;
  padding: 20px;
}

.no-results-content {
  text-align: center;
  max-width: 500px;
}

.no-results-content h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0;
}

.no-results-suggestions {
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-secondary);
  margin: 0;
}

.no-results-suggestions br {
  margin-bottom: 8px;
}

/* 搜索错误提示 */
.search-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: #e74c3c;
  font-size: 16px;
  text-align: center;
  background-color: rgba(231, 76, 60, 0.05);
  border: 1px solid rgba(231, 76, 60, 0.2);
  border-radius: 8px;
  margin: 8px 0;
  padding: 20px;
}

.search-error p {
  margin: 0;
  font-weight: 500;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .results-header {
    padding: 10px 12px;
    gap: 8px;
  }
  
  .results-header-top {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  
  .results-tabs {
    gap: 6px;
  }
  
  .tab-btn {
    padding: 6px 12px;
    font-size: 12px;
  }
  
  .filter-input {
    width: 100%;
  }
  
  .results-sort {
    flex-wrap: wrap;
    gap: 6px;
  }
  
  .results-list {
    padding: 6px;
  }
  
  .result-item {
    padding: 10px;
    margin-bottom: 6px;
  }
  
  .result-file {
    font-size: 13px;
  }
  
  .result-line {
    font-size: 11px;
  }
  
  .result-content {
    font-size: 12px;
  }
}
</style>
