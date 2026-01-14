<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useStore } from 'vuex';
import { ask } from '@tauri-apps/plugin-dialog';
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
  store.commit('search/setContentSearchOptions', history.contentSearchOptions);
  store.commit('search/setFilenameSearchOptions', history.filenameSearchOptions);

  // 自动执行搜索
  store.dispatch('search/performSearch');
}

// 清除搜索历史
async function clearHistory() {
  const confirmed = await ask('确定要清除所有搜索历史吗？', {
    title: '确认清除',
    kind: 'warning'
  });
  if (confirmed) {
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

// 组件初始化结束后打印配置
onMounted(() => {
  console.log('=== SearchHistory 组件初始化完成 ===');
  console.log('历史记录数量:', searchHistory.value.length);
  console.log('历史记录保存路径:', store.state.history.historyPath);
  console.log('=== SearchHistory 组件初始化完成 ===');
});
</script>

<template>
  <div v-if="visible" class="history-modal-overlay">
    <div class="history-modal">
      <div class="modal-header">
        <h2>搜索历史</h2>
        <button @click="closeHistory" class="close-btn">
          &times;
        </button>
      </div>

      <div class="modal-content">
        <div class="history-filter">
          <input v-model="historyFilter" type="text" placeholder="筛选历史记录..." class="history-filter-input" />
        </div>

        <div class="history-list">
          <div v-for="history in filteredHistory" :key="history.id" class="history-item" @click="useHistory(history)">
            <div class="history-pattern">{{ history.pattern }}</div>
            <div class="history-path">{{ history.path }}</div>
            <div class="history-options">
              <span v-if="history.contentSearchOptions.caseInsensitive" class="option-tag">i</span>
              <span v-if="history.contentSearchOptions.wholeWord" class="option-tag">w</span>
              <span v-if="history.contentSearchOptions.regex" class="option-tag">r</span>
              <span v-if="history.contentSearchOptions.ignoreHidden" class="option-tag">h</span>
            </div>
            <div class="history-time">{{ new Date(history.timestamp).toLocaleString() }}</div>
          </div>

          <div v-if="filteredHistory.length === 0" class="no-history">
            <p>{{ historyFilter ? '没有匹配的历史记录' : '暂无搜索历史' }}</p>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="clearHistory" class="clear-history-btn">
          清除所有历史
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 模态对话框遮罩层 */
.history-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.2s ease-out forwards;
}

/* 模态对话框 */
.history-modal {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.2s ease-out forwards;
}

/* 淡入动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* 滑入动画 */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 模态对话框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

/* 关闭按钮 */
.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* 模态对话框内容 */
.modal-content {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 0 20px;
}

/* 历史记录筛选 */
.history-filter {
  padding: 16px 0;
  border-bottom: 1px solid var(--border-color);
}

.history-filter-input {
  width: 100%;
  padding: 8px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
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
  padding: 16px 0;
}

/* 历史记录项 */
.history-item {
  padding: 12px 16px 12px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  flex-direction: column;
  gap: 4px;
  position: relative;
  overflow: hidden;
  min-height: 90px;
}

.history-item::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 3px;
  height: 100%;
  background-color: transparent;
  transition: background-color 0.2s ease;
}

.history-item:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.history-item:hover::before {
  background-color: var(--accent-color);
}

.history-item:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
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
  position: absolute;
  top: 8px;
  right: 8px;
  display: flex;
  gap: 4px;
  z-index: 1;
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

/* 空历史记录 */
.no-history {
  padding: 30px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 14px;
}

/* 模态对话框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

/* 清除历史记录按钮 */
.clear-history-btn {
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.clear-history-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

/* 滚动条样式 */
.history-list::-webkit-scrollbar {
  width: 8px;
}

.history-list::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
}

.history-list::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
</style>
