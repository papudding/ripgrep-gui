<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useStore } from "vuex";

// 导入组件
import SearchConfig from './components/searchConfig/SearchConfig.vue';
import SearchHistory from './components/SearchHistory.vue';
import SearchResults from './components/SearchResults.vue';
import FilePreview from './components/FilePreview.vue';
import SettingsModal from './components/userSetting/SettingsModal.vue';

const store = useStore();

// 搜索历史面板显示状态
const showHistory = ref(false);

// 切换历史记录面板
function toggleHistory() {
  showHistory.value = !showHistory.value;
}

// 关闭历史记录面板
function closeHistory() {
  showHistory.value = false;
}

// 设置对话框显示状态
const showSettings = ref(false);

// 切换设置对话框
function toggleSettings() {
  showSettings.value = !showSettings.value;
}

// 关闭设置对话框
function closeSettings() {
  showSettings.value = false;
}

// 可调整大小分割线相关逻辑
const resizer = ref<HTMLElement | null>(null);
const resultsContainer = ref<HTMLElement | null>(null);
const previewContainer = ref<HTMLElement | null>(null);
const isResizing = ref(false);

// 鼠标按下事件处理
function handleMouseDown(e: MouseEvent) {
  isResizing.value = true;
  // 添加全局事件监听器
  document.addEventListener('mousemove', handleMouseMove);
  document.addEventListener('mouseup', handleMouseUp);
  // 阻止默认行为
  e.preventDefault();
}

// 鼠标移动事件处理
function handleMouseMove(e: MouseEvent) {
  if (!isResizing.value || !resizer.value || !resultsContainer.value || !previewContainer.value) {
    return;
  }

  // 获取父容器的位置和尺寸
  const parentEl = resizer.value.parentElement;
  if (!parentEl) return;

  const parentRect = parentEl.getBoundingClientRect();
  const parentWidth = parentRect.width;

  // 计算新的结果容器宽度（相对于父容器）
  const newResultsWidth = e.clientX - parentRect.left;

  // 限制最小宽度（20%）和最大宽度（80%）
  const minWidth = parentWidth * 0.2;
  const maxWidth = parentWidth * 0.8;
  const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newResultsWidth));

  // 计算百分比宽度
  const resultsWidthPercent = (clampedWidth / parentWidth) * 100;
  const previewWidthPercent = 100 - resultsWidthPercent;

  // 更新样式
  resultsContainer.value.style.flex = `0 0 ${resultsWidthPercent}%`;
  previewContainer.value.style.width = `${previewWidthPercent}%`;
}

// 鼠标释放事件处理
function handleMouseUp() {
  isResizing.value = false;
  // 移除全局事件监听器
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
}

// 组件挂载后获取引用
onMounted(() => {
  resultsContainer.value = document.querySelector('.results-container');
  previewContainer.value = document.querySelector('.preview-container');
});

// 组件卸载前清理事件监听器
onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove);
  document.removeEventListener('mouseup', handleMouseUp);
});

// 监听深色模式变化并应用主题
watch(() => store.state.config.userConfig.darkMode, (isDark) => {
  if (isDark) {
    document.documentElement.classList.add('dark-mode');
  } else {
    document.documentElement.classList.remove('dark-mode');
  }
}, { immediate: true });
</script>

<template>
  <div class="app-container">
    <!-- 搜索配置区域 -->
    <div class="search-config-section">
      <SearchConfig @toggle-history="toggleHistory" @toggle-settings="toggleSettings" />
      <SearchHistory :visible="showHistory" @close="closeHistory" />
      <!-- <HistorySettings /> -->
    </div>

    <!-- 设置对话框 -->
    <SettingsModal :visible="showSettings" @close="closeSettings" />

    <!-- 搜索结果区域 -->
    <div class="search-results-section">
      <!-- 结果列表容器 -->
      <div class="results-container">
        <SearchResults />
      </div>

      <!-- 可调整大小的分割线 -->
      <div class="resizer" @mousedown="handleMouseDown" ref="resizer"></div>

      <!-- 文件预览容器 -->
      <div class="preview-container">
        <FilePreview />
      </div>
    </div>
  </div>
</template>

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

/* 深色模式覆盖样式 */
.dark-mode {
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

/* 深色模式下的匹配高亮 */
.dark-mode .match-highlight {
  background-color: #ffc107;
  color: #000;
}

.dark-mode .preview-content pre code .match-line {
  background-color: rgba(255, 193, 7, 0.2);
  border-left: 3px solid #ffc107;
}

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

/* 全局样式 */
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

/* 应用容器 */
.app-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
}

/* 搜索配置区域 */
.search-config-section {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  overflow-y: auto;
  max-height: 40vh;
}

/* 搜索结果区域 */
.search-results-section {
  flex: 1;
  display: flex;
  flex-direction: row;
  overflow: hidden;
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
}

/* 结果列表容器 */
.results-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
}

/* 文件预览容器 */
.preview-container {
  width: 50%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
  border-left: 1px solid var(--border-color);
}

/* 可调整大小的分割线 */
.resizer {
  width: 4px;
  background-color: var(--border-color);
  cursor: col-resize;
  transition: background-color 0.2s ease;
  flex-shrink: 0;
}

.resizer:hover,
.resizer:active {
  background-color: var(--accent-color);
}

/* 响应式布局 */
@media (max-width: 768px) {
  .search-results-section {
    flex-direction: column;
  }

  .results-container {
    width: 100%;
    height: 50%;
  }

  .preview-container {
    width: 100%;
    height: 50%;
    border-left: none;
    border-top: 1px solid var(--border-color);
  }

  .resizer {
    width: 100%;
    height: 4px;
    cursor: row-resize;
  }
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--bg-primary);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}

::-webkit-scrollbar-thumb:active {
  background: var(--accent-color);
}

/* 确保滚动条在所有容器中一致 */
.search-results-section ::-webkit-scrollbar,
.results-container ::-webkit-scrollbar,
.preview-container ::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
</style>
