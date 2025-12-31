<script setup lang="ts">
import { computed } from "vue";
import { useStore } from 'vuex';
import { highlightMatch } from '../utils/highlight';

const store = useStore();

// 计算属性
const selectedResult = computed(() => store.state.file.selectedResult);
const fileContent = computed(() => store.state.file.fileContent);
const isLoadingFile = computed(() => store.state.file.isLoadingFile);
const searchPattern = computed(() => store.state.search.searchPattern);
</script>

<template>
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
</template>

<style scoped>
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

.loading-indicator {
  font-size: 13px;
  color: var(--text-secondary);
  background-color: var(--bg-primary);
  padding: 4px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
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
</style>
