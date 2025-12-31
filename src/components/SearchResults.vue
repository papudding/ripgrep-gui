<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from 'vuex';
import type { SearchResult } from '../types';
import { highlightMatch } from '../utils/highlight';
import Pagination from './Pagination.vue';

const store = useStore();

// 结果筛选和排序
const resultFilter = ref("");
const sortBy = ref("file"); // file, line, match
const sortOrder = ref("asc"); // asc, desc

// 分页配置
const PAGE_SIZE = 100;
const currentPage = ref(1);

// 计算属性
const isSearching = computed(() => store.state.search.isSearching);
const searchError = computed(() => store.state.search.searchError);
const selectedResult = computed(() => store.state.file.selectedResult);

// 筛选后的结果
const filteredResults = computed(() => {
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
  
  // 重置分页
  resetPagination();
  
  return sortedResults;
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
</script>

<template>
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
</style>
