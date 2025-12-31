<script setup lang="ts">
import { ref, computed } from "vue";
// 使用标准import语法
import { useStore } from 'vuex';
import { open } from '@tauri-apps/plugin-dialog';

// 导入类型
import type { SearchResult, SearchHistory } from './store/index';

const store = useStore();

// 应用启动时加载搜索历史
store.dispatch('loadSearchHistory');

// 应用启动时执行一次历史记录清理
store.dispatch('cleanupSearchHistory');

// 设置定期清理历史记录（每24小时）
setInterval(() => {
  store.dispatch('cleanupSearchHistory');
}, 24 * 60 * 60 * 1000);

// 搜索配置
const searchPath = computed({
  get: () => store.state.searchPath,
  set: (value) => store.commit('setSearchPath', value)
});

const searchPattern = computed({
  get: () => store.state.searchPattern,
  set: (value) => store.commit('setSearchPattern', value)
});

const searchOptions = computed({
  get: () => store.state.searchOptions,
  set: (value) => store.commit('setSearchOptions', value)
});
const isSearching = computed(() => store.state.isSearching);
const searchProgress = computed(() => store.state.searchProgress);

// 搜索结果
// 移除未使用的searchResults变量
// const searchResults = computed(() => store.state.searchResults);
const selectedResult = computed(() => store.state.selectedResult);
const fileContent = computed(() => store.state.fileContent);
const isLoadingFile = computed(() => store.state.isLoadingFile);
const searchError = computed(() => store.state.searchError);

// 历史记录路径设置
const historyPath = computed({
  get: () => store.state.historyPath,
  set: (value) => store.dispatch('setHistoryPath', value)
});

// 历史记录路径输入框的值
const historyPathInput = ref(store.state.historyPath || '');

// 打开目录选择器选择历史记录保存路径
async function selectHistoryPath() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "选择历史记录保存目录"
    });
    
    if (selected && typeof selected === 'string') {
      historyPathInput.value = selected;
      historyPath.value = selected;
    }
  } catch (error) {
    console.error('Failed to open directory picker:', error);
    alert('打开目录选择器失败，请检查应用权限');
  }
}

// 路径设置结果提示
const pathSettingResult = ref({ show: false, success: false, message: '' });

// 关闭提示
function closePathSettingResult() {
  pathSettingResult.value = { show: false, success: false, message: '' };
}

// 手动输入路径后确认设置
async function confirmHistoryPath() {
  const result = await store.dispatch('setHistoryPath', historyPathInput.value || null);
  pathSettingResult.value = { 
    show: true, 
    success: result.success, 
    message: result.message 
  };
  
  // 3秒后自动关闭提示
  setTimeout(closePathSettingResult, 3000);
}

// 结果筛选和排序
const resultFilter = ref("");
const sortBy = ref("file"); // file, line, match
const sortOrder = ref("asc"); // asc, desc

// 分页配置
const PAGE_SIZE = 100;
const currentPage = ref(1);
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

// 切换到指定页
function goToPage(page: number) {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
}

// 加载更多结果
function loadMoreResults() {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
  }
}

// 重置分页
function resetPagination() {
  currentPage.value = 1;
}

// 筛选后的结果
const filteredResults = computed(() => {
  let results = store.getters.filteredSearchResults(resultFilter.value);
  
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
  
  // 重置分页
  resetPagination();
  
  return sortedResults;
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

// 打开文件选择器
async function selectSearchPath() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "选择搜索目录"
    });
    
    if (selected && typeof selected === 'string') {
      searchPath.value = selected;
    }
  } catch (error) {
    console.error('Failed to open directory picker:', error);
    alert('打开目录选择器失败，请检查应用权限');
  }
}



// 防抖函数
function debounce<T extends (...args: any[]) => any>(func: T, delay: number): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// 最小搜索字符长度
const MIN_SEARCH_LENGTH = 2;

// 执行搜索
async function performSearch() {
  if (searchPath.value && searchPattern.value && searchPattern.value.length >= MIN_SEARCH_LENGTH) {
    await store.dispatch('performSearch');
  }
}

// 防抖搜索函数
const debouncedSearch = debounce(performSearch, 500);

// 搜索输入变化时触发防抖搜索
function handleSearchInput() {
  debouncedSearch();
}

// 选择搜索结果
async function selectResult(result: SearchResult) {
  store.commit('setSelectedResult', result);
  await store.dispatch('loadFileContent', result.file);
}

// 高亮匹配文本
function highlightMatch(content: string, match: string) {
  console.log('highlightMatch', content, match);
  if (!match || !content) return content;
  
  // 转义正则表达式特殊字符
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // 将内容按行分割
  const lines = content.split('\n');
  
  // 创建匹配正则表达式
  const escapedMatch = escapeRegExp(match);
  const matchRegex = new RegExp(`(${escapedMatch})`, 'gi');
  
  // 处理每一行
  const highlightedLines = lines.map(line => {
    // 为每行创建新的正则表达式实例，避免lastIndex问题
    const lineMatchRegex = new RegExp(escapedMatch, 'i');
    
    // 检查该行是否包含匹配文本
    const hasMatch = lineMatchRegex.test(line);
    
    // 对行内匹配文本进行高亮
    const highlightedLine = line.replace(matchRegex, '<span class="match-highlight">$1</span>');
    
    // 如果该行包含匹配文本，则添加行级高亮
    if (hasMatch) {
      return `<span class="match-line">${highlightedLine}</span>`;
    }
    
    return highlightedLine;
  });
  
  // 重新组合成完整内容
  return highlightedLines.join('\n');
}

// 搜索历史管理
const showHistory = ref(false);
const historyFilter = ref("");
const searchHistory = computed(() => store.state.searchHistory);

// 筛选后的历史记录
const filteredHistory = computed(() => {
  if (!historyFilter.value) return searchHistory.value;
  
  const filter = historyFilter.value.toLowerCase();
  return searchHistory.value.filter((history: SearchHistory) => 
    history.pattern.toLowerCase().includes(filter) || 
    history.path.toLowerCase().includes(filter)
  );
});

// 切换历史记录面板
function toggleHistory() {
  showHistory.value = !showHistory.value;
}

// 使用历史记录
function useHistory(history: SearchHistory) {
  searchPath.value = history.path;
  searchPattern.value = history.pattern;
  store.commit('setSearchOptions', history.options);
  showHistory.value = false;
  // 自动执行搜索
  performSearch();
}

// 清除搜索历史
function clearHistory() {
  if (confirm('确定要清除所有搜索历史吗？')) {
    store.commit('clearSearchHistory');
  }
}
</script>

<template>
  <div class="app-container">
    <!-- 搜索配置区域 -->
    <div class="search-config">
      <div class="search-header">
        <h1>ripgrep GUI</h1>
      </div>
      
      <div class="search-input-section">
        <!-- 文件路径选择 -->
        <div class="path-selector">
          <button @click="selectSearchPath" class="path-btn">
            {{ searchPath || '选择搜索目录' }}
          </button>
        </div>
        
        <!-- 搜索模式输入 -->
        <div class="search-input-group">
          <div class="search-input-wrapper">
            <input
              v-model="searchPattern"
              type="text"
              placeholder="输入搜索模式... (至少2个字符)"
              class="search-input"
              @keyup.enter="performSearch"
              @input="handleSearchInput"
            />
            <div v-if="searchPattern && searchPattern.length < MIN_SEARCH_LENGTH" class="search-hint">
              至少需要输入{{ MIN_SEARCH_LENGTH }}个字符
            </div>
          </div>
          <button 
            @click="toggleHistory" 
            class="history-btn"
            :class="{ 'active': showHistory }"
          >
            历史
          </button>
          <button 
            @click="performSearch" 
            class="search-btn"
            :disabled="isSearching || !searchPath || !searchPattern || searchPattern.length < MIN_SEARCH_LENGTH"
          >
            {{ isSearching ? '搜索中...' : '搜索' }}
          </button>
        </div>
      </div>
      
      <!-- 搜索历史面板 -->
      <div v-if="showHistory" class="history-panel">
        <div class="history-header">
          <h3>搜索历史</h3>
          <div class="history-header-actions">
            <button @click="clearHistory" class="clear-history-btn">
              清除
            </button>
          </div>
        </div>
        
        <div class="history-filter">
          <input
            v-model="historyFilter"
            type="text"
            placeholder="筛选历史记录..."
            class="history-filter-input"
          />
        </div>
        
        <div class="history-list">
          <div 
            v-for="history in filteredHistory" 
            :key="history.id"
            class="history-item"
            @click="useHistory(history)"
          >
            <div class="history-pattern">{{ history.pattern }}</div>
            <div class="history-path">{{ history.path }}</div>
            <div class="history-options">
              <span v-if="history.options.caseInsensitive" class="option-tag">i</span>
              <span v-if="history.options.wholeWord" class="option-tag">w</span>
              <span v-if="history.options.regex" class="option-tag">r</span>
              <span v-if="history.options.ignoreHidden" class="option-tag">h</span>
            </div>
            <div class="history-time">{{ new Date(history.timestamp).toLocaleString() }}</div>
          </div>
          
          <div v-if="filteredHistory.length === 0" class="no-history">
            <p>{{ historyFilter ? '没有匹配的历史记录' : '暂无搜索历史' }}</p>
          </div>
        </div>
      </div>
      
      <!-- 搜索选项配置 -->
      <div class="search-options">
        <div class="option-group">
          <label class="option-label">
            <input 
              type="checkbox" 
              v-model="searchOptions.caseInsensitive"
            />
            忽略大小写
          </label>
          
          <label class="option-label">
            <input 
              type="checkbox" 
              v-model="searchOptions.wholeWord"
            />
            全字匹配
          </label>
          
          <label class="option-label">
            <input 
              type="checkbox" 
              v-model="searchOptions.regex"
            />
            正则表达式
          </label>
          
          <label class="option-label">
            <input 
              type="checkbox" 
              v-model="searchOptions.ignoreHidden"
            />
            忽略隐藏文件
          </label>
        </div>
        
        <div class="option-group">
          <div class="depth-control">
            <label>搜索深度:</label>
            <input 
              type="number" 
              min="0" 
              v-model.number="searchOptions.maxDepth"
              @input="store.commit('setSearchOptions', { maxDepth: searchOptions.maxDepth })"
            />
            <span class="depth-hint">(0 = 无限制)</span>
          </div>
        </div>
      </div>
      
      <!-- 历史记录路径设置 -->
      <div class="history-path-settings">
        <div class="settings-header">
          <h3>历史记录设置</h3>
        </div>
        <div class="path-setting">
          <label for="history-path">保存路径:</label>
          <div class="path-input-group">
            <input
              id="history-path"
              v-model="historyPathInput"
              type="text"
              placeholder="输入历史记录保存路径或点击选择按钮"
              class="path-input"
            />
            <button @click="selectHistoryPath" class="browse-btn">
              浏览
            </button>
            <button @click="confirmHistoryPath" class="confirm-btn">
              确认
            </button>
          </div>
          <div class="path-hint">
            当前保存路径: {{ historyPath || '未设置，使用默认路径' }}
          </div>
          
          <!-- 路径设置结果提示 -->
          <div 
            v-if="pathSettingResult.show" 
            class="setting-result"
            :class="{ 'success': pathSettingResult.success, 'error': !pathSettingResult.success }"
          >
            <span>{{ pathSettingResult.message }}</span>
            <button @click="closePathSettingResult" class="close-btn">&times;</button>
          </div>
        </div>
      </div>
      
      <!-- 搜索进度 -->
      <div v-if="isSearching" class="search-progress">
        <div class="progress-bar">
          <div 
            class="progress-fill" 
            :style="{ width: `${searchProgress}%` }"
          ></div>
        </div>
        <div class="progress-text">{{ searchProgress }}%</div>
      </div>
    </div>
    
    <!-- 搜索结果区域 -->
    <div class="search-results">
      <div class="results-header">
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
          <div class="result-file">{{ result.file }}</div>
          <div class="result-line">{{ result.line }}:{{ result.column }}</div>
          <div 
            class="result-content" 
            v-html="highlightMatch(result.content, result.match)"
          ></div>
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
        <div v-if="filteredResults.length > 0 && !isSearching" class="pagination">
          <div class="pagination-info">
            显示 {{ (currentPage - 1) * PAGE_SIZE + 1 }} - {{ Math.min(currentPage * PAGE_SIZE, filteredResults.length) }} 条，共 {{ filteredResults.length }} 条结果
          </div>
          <div class="pagination-controls">
            <button 
              @click="goToPage(1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              首页
            </button>
            <button 
              @click="goToPage(currentPage - 1)" 
              :disabled="currentPage === 1"
              class="pagination-btn"
            >
              上一页
            </button>
            <span class="page-info">
              第 {{ currentPage }}/{{ totalPages }} 页
            </span>
            <button 
              @click="goToPage(currentPage + 1)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              下一页
            </button>
            <button 
              @click="goToPage(totalPages)" 
              :disabled="currentPage === totalPages"
              class="pagination-btn"
            >
              末页
            </button>
            <button 
              @click="loadMoreResults"
              :disabled="currentPage === totalPages"
              class="load-more-btn"
            >
              加载更多
            </button>
          </div>
        </div>
      </div>
      
      <!-- 文件预览区域 -->
      <div v-if="selectedResult" class="file-preview">
        <div class="preview-header">
          <h3>文件预览: {{ selectedResult.file }}</h3>
          <div v-if="isLoadingFile" class="loading-indicator">加载中...</div>
        </div>
        <div class="preview-content">
          <pre class="line-numbers">
            <code v-if="isLoadingFile">加载文件内容中...</code>
            <code v-else-if="fileContent" v-html="highlightMatch(fileContent, searchPattern)"></code>
            <code v-else>无法加载文件内容</code>
          </pre>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 搜索配置区域 */
.search-config {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.search-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.search-input-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.path-selector {
  width: 100%;
}

.path-btn {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.path-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

.search-input-group {
  display: flex;
  gap: 8px;
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
}

/* 搜索输入包装器 */
.search-input-wrapper {
  position: relative;
  flex: 1;
}

/* 搜索提示 */
.search-hint {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 8px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  color: var(--text-muted);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 历史记录按钮 */
.history-btn {
  padding: 10px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.history-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

.history-btn.active {
  background-color: var(--accent-light);
  border-color: var(--accent-color);
  color: var(--accent-color);
}

.search-btn {
  padding: 10px 20px;
  background-color: var(--accent-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 搜索历史面板 */
.history-panel {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  max-height: 300px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.history-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.clear-history-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

/* 历史记录筛选 */
.history-filter {
  margin-bottom: 12px;
}

.history-filter-input {
  width: 100%;
  padding: 8px 10px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.2s ease;
}

.history-filter-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
}

/* 历史记录列表 */
.history-list {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 历史记录项 */
.history-item {
  padding: 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.history-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.history-pattern {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-path {
  font-size: 12px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-options {
  display: flex;
  gap: 4px;
  margin-top: 4px;
}

.option-tag {
  padding: 2px 6px;
  background-color: var(--accent-light);
  border: 1px solid var(--accent-color);
  border-radius: 10px;
  color: var(--accent-color);
  font-size: 11px;
  font-weight: 600;
  min-width: 18px;
  text-align: center;
}

.history-time {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 2px;
}

.no-history {
  padding: 20px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 13px;
}


/* 搜索选项 */
.search-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: center;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  transition: color 0.2s ease;
}

.option-label:hover {
  color: var(--text-primary);
}

.option-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-color);
}

.depth-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.depth-control label {
  font-size: 14px;
  color: var(--text-secondary);
}

.depth-control input {
  width: 60px;
  padding: 6px 8px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
}

.depth-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* 搜索进度 */
.search-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--accent-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
}

/* 搜索结果区域 */
.search-results {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
}

.results-header {
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  display: flex;
  flex-direction: column;
  gap: 12px;
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
  padding: 12px;
  margin-bottom: 8px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.result-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.result-item.selected {
  background-color: var(--accent-light);
  border-color: var(--accent-color);
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

/* 分页控件 */
.pagination {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px 0;
  border-top: 1px solid var(--border-color);
  margin-top: 8px;
}

.pagination-info {
  font-size: 13px;
  color: var(--text-secondary);
  text-align: center;
}

.pagination-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.pagination-btn {
  padding: 6px 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.pagination-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.page-info {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 100px;
  text-align: center;
}

.load-more-btn {
  padding: 6px 16px;
  background-color: var(--accent-color);
  border: 1px solid var(--accent-color);
  border-radius: 6px;
  color: white;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-more-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
}

.load-more-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 文件预览 */
.file-preview {
  padding: 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  max-height: 300px;
  overflow-y: auto;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.preview-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.searching-indicator {
  font-size: 13px;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
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

.preview-content {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: auto;
  position: relative;
}

.preview-content pre {
  margin: 0;
  font-size: 13px;
  color: var(--text-primary);
  font-family: monospace;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  padding: 12px;
  counter-reset: line;
}

.preview-content pre.line-numbers code {
  display: block;
  padding-left: 60px;
  position: relative;
}

.preview-content pre.line-numbers code::before {
  counter-increment: line;
  content: counter(line);
  position: absolute;
  left: 0;
  top: 0;
  width: 50px;
  text-align: right;
  padding-right: 12px;
  color: var(--text-muted);
  border-right: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  font-size: 12px;
  line-height: 1.5;
  user-select: none;
}

.preview-content pre.line-numbers code:hover::before {
  background-color: var(--bg-hover);
}

.preview-content pre code {
  font-family: monospace;
  font-size: 13px;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
</style>

<style>
:root {
  /* 浅色模式 */
  --bg-primary: #ffffff;
  --bg-secondary: #fafafa;
  --bg-hover: #f5f5f5;
  --border-color: #e0e0e0;
  --border-hover: #d0d0d0;
  --text-primary: #1a1a1a;
  --text-secondary: #666666;
  --text-muted: #999999;
  --accent-color: #396cd8;
  --accent-hover: #2d54a7;
  --accent-light: #e8f0fe;
}

@media (prefers-color-scheme: dark) {
  :root {
    /* 深色模式 */
    --bg-primary: #1e1e1e;
    --bg-secondary: #252526;
    --bg-hover: #2a2d2e;
    --border-color: #3e3e42;
    --border-hover: #4e4e53;
    --text-primary: #cccccc;
    --text-secondary: #969696;
    --text-muted: #6a6a6a;
    --accent-color: #007acc;
    --accent-hover: #1f8ad6;
    --accent-light: rgba(0, 122, 204, 0.1);
  }
}

/* 匹配高亮 */
.match-highlight {
  background-color: #ffeb3b;
  color: #000;
  font-weight: 600;
  border-radius: 2px;
  padding: 0 2px;
}

/* 匹配行高亮 - 适应pre标签内的显示 */
.preview-content pre code .match-line {
  background-color: rgba(255, 235, 59, 0.2);
  border-left: 3px solid #ffeb3b;
  padding: 0 4px;
  margin: 0 -4px;
  border-radius: 0 2px 2px 0;
  display: inline-block;
  width: calc(100% + 8px);
}

/* 历史记录路径设置样式 */
.history-path-settings {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 12px 16px;
  margin-top: 12px;
  border-radius: 8px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.settings-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.path-setting {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-setting label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.path-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.path-input {
  flex: 1;
  min-width: 200px;
  padding: 6px 10px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.2s ease;
}

.path-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
  outline: none;
}

.browse-btn, .confirm-btn {
  padding: 6px 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.browse-btn:hover, .confirm-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.confirm-btn {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.confirm-btn:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.path-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 设置结果提示 */
.setting-result {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  animation: fadeIn 0.3s ease;
}

.setting-result.success {
  background-color: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.setting-result.error {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.setting-result .close-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.setting-result .close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 深色模式下的匹配高亮 */
@media (prefers-color-scheme: dark) {
  .match-highlight {
    background-color: #ffc107;
    color: #000;
  }
  
  .preview-content pre code .match-line {
    background-color: rgba(255, 193, 7, 0.2);
    border-left: 3px solid #ffc107;
  }
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  margin: 0;
  padding: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: var(--text-primary);
  background-color: var(--bg-primary);
}

#app {
  height: 100vh;
  overflow: hidden;
}
</style>