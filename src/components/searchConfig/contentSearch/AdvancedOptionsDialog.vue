<script setup lang="ts">
import { computed } from "vue";
import { useStore } from 'vuex';

const emit = defineEmits(['close']);
const store = useStore();

// 内容搜索选项
const contentSearchOptions = computed({
  get: () => store.state.search.contentSearchOptions,
  set: (value) => store.commit('search/setContentSearchOptions', value)
});

// 关闭对话框
function closeDialog() {
  emit('close');
}
</script>

<template>
  <div class="dialog-content">
    <div class="dialog-header">
      <h3>内容搜索高级选项</h3>
      <button class="dialog-close" @click="closeDialog">&times;</button>
    </div>
    
    <div class="dialog-body">
      <div class="option-group">
        <div class="depth-control">
          <label>搜索深度:</label>
          <input 
            type="number" 
            min="0" 
            v-model.number="contentSearchOptions.maxDepth"
          />
          <span class="depth-hint">(0 = 无限制)</span>
        </div>
      </div>
    </div>
    
    <div class="dialog-footer">
      <button class="dialog-button" @click="closeDialog">关闭</button>
    </div>
  </div>
</template>

<style scoped>
/* 对话框内容 */
.dialog-content {
  background-color: var(--bg-primary);
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 500px;
  animation: dialogSlideIn 0.2s ease-out;
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid var(--border-color);
}

.dialog-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

/* 对话框关闭按钮 */
.dialog-close {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background-color: var(--bg-hover);
  color: var(--text-primary);
}

/* 对话框主体 */
.dialog-body {
  padding: 16px;
}

/* 选项组 */
.option-group {
  margin-bottom: 16px;
}

/* 深度控制 */
.depth-control {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.depth-control label {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
}

.depth-control input {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  width: 80px;
}

.depth-control input:focus {
  outline: none;
  border-color: var(--border-hover);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

.depth-hint {
  font-size: 12px;
  color: var(--text-secondary);
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  padding: 16px;
  border-top: 1px solid var(--border-color);
  gap: 8px;
}

/* 对话框按钮 */
.dialog-button {
  padding: 6px 16px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-button:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

/* 动画 */
@keyframes dialogSlideIn {
  from {
    opacity: 0;
    transform: translateY(-20px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
