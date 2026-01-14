<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from 'vuex';
import AdvancedOptionsDialog from './AdvancedOptionsDialog.vue';

const store = useStore();

// 对话框显示状态
const showDialog = ref(false);

// 内容搜索选项
const contentSearchOptions = computed({
  get: () => store.state.search.contentSearchOptions,
  set: (value) => store.commit('search/setContentSearchOptions', value)
});

// 打开对话框
function openDialog() {
  showDialog.value = true;
}

// 关闭对话框
function closeDialog() {
  showDialog.value = false;
}
</script>

<template>
  <div class="content-search-options">
    <div class="option-group inline-header">
      <span class="option-section-title">内容搜索:</span>

      <label class="option-label">
        <input type="checkbox" v-model="contentSearchOptions.caseInsensitive" />
        忽略大小写
      </label>

      <label class="option-label">
        <input type="checkbox" v-model="contentSearchOptions.wholeWord" />
        全字匹配
      </label>

      <label class="option-label">
        <input type="checkbox" v-model="contentSearchOptions.regex" />
        正则表达式
      </label>

      <label class="option-label">
        <input type="checkbox" v-model="contentSearchOptions.ignoreHidden" />
        忽略隐藏文件
      </label>

      <button class="advanced-toggle inline-toggle" @click="openDialog">
        高级
      </button>
    </div>

    <!-- 高级选项对话框 -->
    <div v-if="showDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog-container" @click.stop>
        <AdvancedOptionsDialog @close="closeDialog" />
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 内容搜索选项 */
.content-search-options {
  margin-bottom: 12px;
}

/* 内联标题选项组 */
.option-group.inline-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 8px;
  flex-wrap: wrap;
}

/* 选项部分标题 */
.option-section-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

/* 高级选项切换按钮 */
.advanced-toggle {
  padding: 4px 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-secondary);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.advanced-toggle:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
  transform: translateY(-1px);
}

.advanced-toggle:active {
  transform: translateY(0);
}

/* 内联切换按钮 */
.advanced-toggle.inline-toggle {
  /* 使用gap属性控制间距，不再需要margin-right */
}

/* 对话框覆盖层 */
.dialog-overlay {
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
  animation: fadeIn 0.2s ease-out;
}

/* 对话框容器 */
.dialog-container {
  position: relative;
}

/* 动画 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}
</style>
