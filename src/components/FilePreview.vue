<script setup lang="ts">
import { computed, ref } from "vue";
import { useStore } from 'vuex';
import { highlightMatch } from '../utils/highlight';

const store = useStore();

// 计算属性
const selectedResult = computed(() => store.state.file.selectedResult);
const fileContent = computed(() => store.state.file.fileContent);
const isLoadingFile = computed(() => store.state.file.isLoadingFile);
const searchPattern = computed(() => store.state.search.searchPattern);

// 代码内容容器引用，用于同步滚动
const codeContentRef = ref<HTMLElement | null>(null);
const lineNumbersRef = ref<HTMLElement | null>(null);

// 计算行号
const lineNumbers = computed(() => {
  if (!fileContent.value) return [];
  const lines = fileContent.value.split('\n');
  // 生成从1开始的连续行号
  return Array.from({ length: lines.length }, (_, i) => i + 1);
});

// 同步滚动处理函数
const handleScroll = () => {
  if (codeContentRef.value && lineNumbersRef.value) {
    lineNumbersRef.value.scrollTop = codeContentRef.value.scrollTop;
  }
};
</script>

<template>
  <div v-if="selectedResult" class="file-preview">
    <div class="preview-header">
      <h3>文件预览: {{ selectedResult.file }}</h3>
      <div v-if="isLoadingFile" class="loading-indicator">加载中...</div>
    </div>
    <div class="preview-content">
      <!-- 使用flex布局实现行号区域与代码内容区域分离 -->
      <div class="code-container">
        <!-- 行号区域 -->
        <div 
          ref="lineNumbersRef" 
          class="line-numbers"
        >
          <div v-if="isLoadingFile" class="loading-line-numbers">加载中...</div>
          <div v-else-if="fileContent" class="line-number" v-for="number in lineNumbers" :key="number">
            {{ number }}
          </div>
          <div v-else class="error-line-numbers">无法加载行号</div>
        </div>
        
        <!-- 代码内容区域 -->
        <pre 
          ref="codeContentRef"
          class="code-content"
          @scroll="handleScroll"
        >
          <code v-if="isLoadingFile">加载文件内容中...</code>
          <code v-else-if="fileContent" v-html="highlightMatch(fileContent, searchPattern)"></code>
          <code v-else>无法加载文件内容</code>
        </pre>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 文件预览 */
.file-preview {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
  background-color: var(--bg-primary);
  overflow: hidden;
  transition: background-color 0.2s ease;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
  transition: all 0.2s ease;
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
  flex: 1;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  overflow: hidden;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: all 0.2s ease;
}

/* 代码容器，使用flex布局 */
.code-container {
  display: flex;
  height: 100%;
  background: var(--bg-primary);
  border-radius: 8px;
  overflow: hidden;
  font-family: 'Consolas', 'Monaco', monospace;
  transition: all 0.2s ease;
}

/* 行号区域样式 */
.line-numbers {
  padding: 12px 8px 12px 12px;
  text-align: right;
  color: var(--text-muted);
  border-right: 1px solid var(--border-color);
  background: var(--bg-secondary);
  user-select: none;
  line-height: 1.5;
  font-size: 13px;
  overflow: hidden;
  min-width: 55px;
  transition: all 0.2s ease;
}

.line-number {
  font-size: 13px;
  line-height: 1.5;
}

.loading-line-numbers,
.error-line-numbers {
  padding: 12px 0;
  text-align: center;
  color: var(--text-muted);
  font-size: 13px;
  line-height: 1.5;
}

/* 代码内容区域样式 */
.code-content {
  padding: 12px 12px 12px 8px;
  flex: 1;
  white-space: pre-wrap;
  word-break: break-all;
  line-height: 1.5;
  margin: 0;
  overflow: auto;
  background: var(--bg-primary);
  font-size: 13px;
  color: var(--text-primary);
  font-family: 'Consolas', 'Monaco', monospace;
  transition: all 0.2s ease;
}

.code-content code {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  line-height: 1.5;
}

/* 确保响应式设计 */
@media (max-width: 768px) {
  .file-preview {
    padding: 8px;
  }
  
  .preview-header h3 {
    font-size: 12px;
  }
  
  .code-container {
    font-size: 12px;
  }
  
  .line-numbers {
    min-width: 40px;
    padding: 8px 5px 8px 8px;
  }
  
  .code-content {
    padding: 8px 8px 8px 5px;
  }
}
</style>
