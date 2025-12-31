<script setup lang="ts">
// Props
const props = defineProps<{
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize: number;
}>();

// 事件
const emit = defineEmits<{
  (e: 'goToPage', page: number): void;
  (e: 'loadMore'): void;
}>();

// 切换到指定页
function goToPage(page: number) {
  if (page >= 1 && page <= props.totalPages) {
    emit('goToPage', page);
  }
}

// 加载更多结果
function loadMoreResults() {
  if (props.currentPage < props.totalPages) {
    emit('loadMore');
  }
}
</script>

<template>
  <div class="pagination">
    <div class="pagination-info">
      显示 {{ (currentPage - 1) * pageSize + 1 }} - {{ Math.min(currentPage * pageSize, totalResults) }} 条，共 {{ totalResults }} 条结果
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
</template>

<style scoped>
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
</style>
