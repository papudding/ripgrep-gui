<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from 'vuex';
import type { SearchHistory } from '../types';

const store = useStore();

// Props
defineProps<{
  visible: boolean
}>();

// 历史记录筛选
const historyFilter = ref("");

// 计算属性
const searchHistory = computed(() => store.state.history.searchHistory);

// 筛选后的历史记录
const filteredHistory = computed(() => {
  if (!historyFilter.value) return searchHistory.value;
  
  const filter = historyFilter.value.toLowerCase();
  return searchHistory.value.filter((history: SearchHistory) => 
    history.pattern.toLowerCase().includes(filter) || 
    history.path.toLowerCase().includes(filter)
  );
});

// 使用历史记录
function useHistory(history: SearchHistory) {
  store.commit('search/setSearchPath', history.path);
  store.commit('search/setSearchPattern', history.pattern);
  store.commit('search/setSearchOptions', history.options);
  // 自动执行搜索
  store.dispatch('search/performSearch');
}

// 清除搜索历史
function clearHistory() {
  if (confirm('确定要清除所有搜索历史吗？')) {
    store.commit('history/clearSearchHistory');
  }
}

// 事件
const emit = defineEmits<{
  (e: 'close'): void
}>();

// 关闭历史记录面板
const closeHistory = () => {
  emit('close');
};
</script>

<template>
  <div v-if="visible" class="history-panel">
    <div class="history-header">
      <h3>搜索历史</h3>
      <div class="history-header-actions">
        <button @click="clearHistory" class="clear-history-btn">
          清除
        </button>
        <button @click="closeHistory" class="close-history-btn">
          关闭
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
</template>

<style scoped>
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

.clear-history-btn,
.close-history-btn {
  padding: 4px 8px;
  background-color: transparent;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-left: 8px;
}

.clear-history-btn:hover,
.close-history-btn:hover {
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
</style>
