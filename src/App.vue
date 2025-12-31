<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useStore } from 'vuex';

// 导入组件
import SearchConfig from './components/SearchConfig.vue';
import SearchHistory from './components/SearchHistory.vue';
import SearchResults from './components/SearchResults.vue';
import FilePreview from './components/FilePreview.vue';
import HistorySettings from './components/HistorySettings.vue';

const store = useStore();

// 应用启动时加载搜索历史
store.dispatch('history/loadSearchHistory');

// 应用启动时执行一次历史记录清理
store.dispatch('history/cleanupSearchHistory');

// 设置定期清理历史记录（每24小时）
setInterval(() => {
  store.dispatch('history/cleanupSearchHistory');
}, 24 * 60 * 60 * 1000);

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


</script>

<template>
  <div class="app-container">
    <!-- 搜索配置区域 -->
    <div class="search-config-section">
      <SearchConfig @toggle-history="toggleHistory" />
      <SearchHistory :visible="showHistory" @close="closeHistory" />
      <HistorySettings />
    </div>
    
    <!-- 搜索结果区域 -->
    <div class="search-results-section">
      <SearchResults />
      <FilePreview />
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
  flex-direction: column;
  overflow: hidden;
  background-color: var(--bg-primary);
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
