<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useStore } from 'vuex';
import { open } from '@tauri-apps/plugin-dialog';


const store = useStore();

// 搜索配置
const searchPath = computed({
  get: () => store.state.search.searchPath,
  set: (value) => store.commit('search/setSearchPath', value)
});

const searchPattern = computed({
  get: () => store.state.search.searchPattern,
  set: (value) => store.commit('search/setSearchPattern', value)
});

const searchOptions = computed({
  get: () => store.state.search.searchOptions,
  set: (value) => store.commit('search/setSearchOptions', value)
});

const isSearching = computed(() => store.state.search.isSearching);
const searchProgress = computed(() => store.state.search.searchProgress);

// 最小搜索字符长度
const MIN_SEARCH_LENGTH = 2;

// 执行搜索
async function performSearch() {
  if (searchPath.value && searchPattern.value && searchPattern.value.length >= MIN_SEARCH_LENGTH) {
    await store.dispatch('search/performSearch');
  }
}

// 打开目录选择器
async function selectSearchPath() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "选择搜索目录"
    });
    
    if (selected && typeof selected === 'string') {
      searchPath.value = selected;
    }
  } catch (error) {
    console.error('Failed to open directory picker:', error);
    alert('打开目录选择器失败，请检查应用权限');
  }
}

// 事件
const emit = defineEmits<{
  (e: 'toggleHistory'): void
  (e: 'toggleSettings'): void
}>();

// 切换历史记录面板
function toggleHistory() {
  emit('toggleHistory');
}

// 组件初始化结束后打印配置
onMounted(() => {
  console.log('=== SearchConfig 组件初始化完成 ===');
  console.log('搜索路径:', searchPath.value);
  console.log('=== SearchConfig 组件初始化完成 ===');
});
</script>

<template>
  <div class="search-config">
    <div class="search-header">
      <h1>ripgrep GUI</h1>
      <button 
        @click="$emit('toggleSettings')" 
        class="settings-btn"
      >
        设置
      </button>
    </div>
    
    <div class="search-input-section">
      <!-- 文件路径选择 -->
      <div class="path-selector">
        <button @click="selectSearchPath" class="path-btn">
          {{ searchPath || '选择搜索目录' }}
        </button>
      </div>
      
      <!-- 搜索模式输入 -->
      <div class="search-input-group">
        <div class="search-input-wrapper">
          <input
            v-model="searchPattern"
            type="text"
            placeholder="输入搜索模式... (至少2个字符)"
            class="search-input"
            @keyup.enter="performSearch"
          />
          <div v-if="searchPattern && searchPattern.length < MIN_SEARCH_LENGTH" class="search-hint">
            至少需要输入{{ MIN_SEARCH_LENGTH }}个字符
          </div>
        </div>
        <button 
          @click="toggleHistory" 
          class="history-btn"
        >
          历史
        </button>
        <button 
          @click="performSearch" 
          class="search-btn"
          :disabled="isSearching || !searchPath || !searchPattern || searchPattern.length < MIN_SEARCH_LENGTH"
        >
          {{ isSearching ? '搜索中...' : '搜索' }}
        </button>
      </div>
    </div>
    
    <!-- 搜索选项配置 -->
    <div class="search-options">
      <div class="option-group">
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="searchOptions.caseInsensitive"
          />
          忽略大小写
        </label>
        
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="searchOptions.wholeWord"
          />
          全字匹配
        </label>
        
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="searchOptions.regex"
          />
          正则表达式
        </label>
        
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="searchOptions.ignoreHidden"
          />
          忽略隐藏文件
        </label>
        
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="searchOptions.filenameExactMatch"
          />
          文件名精确匹配
        </label>
      </div>
      
      <div class="option-group">
        <div class="depth-control">
          <label>搜索深度:</label>
          <input 
            type="number" 
            min="0" 
            v-model.number="searchOptions.maxDepth"
            @input="store.commit('setSearchOptions', { maxDepth: searchOptions.maxDepth })"
          />
          <span class="depth-hint">(0 = 无限制)</span>
        </div>
      </div>
    </div>
    
    <!-- 搜索进度 -->
    <div v-if="isSearching" class="search-progress">
      <div class="progress-bar">
        <div 
          class="progress-fill" 
          :style="{ width: `${searchProgress}%` }"
        ></div>
      </div>
      <div class="progress-text">{{ searchProgress }}%</div>
    </div>
  </div>
</template>

<style scoped>
/* 搜索配置区域 */
.search-config {
  background-color: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  padding: 12px 16px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  transition: box-shadow 0.2s ease;
}

.search-header h1 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text-primary);
}

.search-input-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.path-selector {
  width: 100%;
}

.path-btn {
  width: 100%;
  text-align: left;
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.path-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

.search-input-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .search-config {
    padding: 10px 12px;
  }
  
  .search-header h1 {
    font-size: 20px;
    margin-bottom: 12px;
  }
  
  .search-input-group {
    flex-direction: column;
  }
  
  .option-group {
    gap: 12px;
  }
  
  .option-label {
    font-size: 13px;
  }
}

.search-input {
  flex: 1;
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.search-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
}

/* 搜索输入包装器 */
.search-input-wrapper {
  position: relative;
  flex: 1;
}

/* 搜索提示 */
.search-hint {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  padding: 8px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 0 0 8px 8px;
  font-size: 12px;
  color: var(--text-muted);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

/* 历史记录按钮 */
.history-btn {
  padding: 10px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.history-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.03);
  opacity: 0;
  transition: opacity 0.2s ease;
}

.history-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.history-btn:hover::before {
  opacity: 1;
}

.history-btn.active {
  background-color: var(--accent-light);
  border-color: var(--accent-color);
  color: var(--accent-color);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(57, 108, 216, 0.2);
}

.history-btn.active::before {
  background-color: rgba(57, 108, 216, 0.1);
  opacity: 1;
}

.search-btn {
  padding: 10px 20px;
  background-color: var(--accent-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
}

.search-btn::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 0;
  height: 0;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.3);
  transform: translate(-50%, -50%);
  transition: width 0.3s ease, height 0.3s ease;
}

.search-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(57, 108, 216, 0.25);
}

.search-btn:hover:not(:disabled)::before {
  width: 200px;
  height: 200px;
}

.search-btn:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(57, 108, 216, 0.2);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

/* 搜索选项 */
.search-options {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.option-group {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  align-items: center;
  padding: 8px 0;
  border-top: 1px solid var(--border-color);
}

.option-group:first-child {
  border-top: none;
}

.option-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 13px;
  color: var(--text-secondary);
  transition: all 0.2s ease;
  padding: 4px 0;
}

.option-label:hover {
  color: var(--text-primary);
  transform: translateY(-1px);
}

.option-label input[type="checkbox"] {
  width: 16px;
  height: 16px;
  accent-color: var(--accent-color);
  transition: all 0.2s ease;
}

.option-label input[type="checkbox"]:hover {
  transform: scale(1.1);
}

.depth-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.depth-control label {
  font-size: 14px;
  color: var(--text-secondary);
}

.depth-control input {
  width: 60px;
  padding: 6px 8px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
}

.depth-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* 搜索进度 */
.search-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.progress-bar {
  flex: 1;
  height: 6px;
  background-color: var(--bg-primary);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background-color: var(--accent-color);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: var(--text-secondary);
  min-width: 40px;
}

/* 搜索头部样式 */
.search-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* 设置按钮 */
.settings-btn {
  padding: 8px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.settings-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}
</style>
