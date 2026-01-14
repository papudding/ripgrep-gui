<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useStore } from 'vuex';

const store = useStore();

// 临时变量用于处理数组输入
const extensionsInput = ref('');
const excludePatternsInput = ref('');

// 文件名搜索选项
const filenameSearchOptions = computed({
  get: () => store.state.search.filenameSearchOptions,
  set: (value) => store.commit('search/setFilenameSearchOptions', value)
});

// 监听 filenameSearchOptions 的变化，更新临时变量
watch(() => filenameSearchOptions.value.extensions, (newValue) => {
  extensionsInput.value = newValue.join(', ');
}, { immediate: true });

watch(() => filenameSearchOptions.value.excludePatterns, (newValue) => {
  excludePatternsInput.value = newValue.join(', ');
}, { immediate: true });

// 处理扩展名输入变化
function handleExtensionsInput() {
  filenameSearchOptions.value.extensions = extensionsInput.value.split(',').map(e => e.trim()).filter(e => e);
}

// 处理排除模式输入变化
function handleExcludePatternsInput() {
  filenameSearchOptions.value.excludePatterns = excludePatternsInput.value.split(',').map(e => e.trim()).filter(e => e);
}

// 事件
const emit = defineEmits<{
  (e: 'close'): void
}>();

// 关闭对话框
function closeDialog() {
  emit('close');
}
</script>

<template>
  <div class="filename-advanced-options-dialog">
    <div class="dialog-header">
      <h3>文件名搜索高级选项</h3>
      <button class="close-btn" @click="closeDialog">×</button>
    </div>
    
    <div class="dialog-content">
      <div class="option-group">
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="filenameSearchOptions.noIgnore"
          />
          包含忽略文件
        </label>
        
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="filenameSearchOptions.noIgnoreVcs"
          />
          包含VCS忽略文件
        </label>
        
        <label class="option-label">
          <input 
            type="checkbox" 
            v-model="filenameSearchOptions.followSymlinks"
          />
          跟随符号链接
        </label>
      </div>
      
      <div class="option-group">
        <div class="depth-control">
          <label>最大搜索深度:</label>
          <input 
            type="number" 
            min="0" 
            v-model.number="filenameSearchOptions.maxDepth"
          />
          <span class="depth-hint">(0 = 无限制)</span>
        </div>
        
        <div class="depth-control">
          <label>最小搜索深度:</label>
          <input 
            type="number" 
            min="0" 
            v-model.number="filenameSearchOptions.minDepth"
          />
        </div>
      </div>
      
      <div class="option-group">
        <div class="input-control">
          <label>文件扩展名:</label>
          <input 
            type="text" 
            placeholder="例如: js,ts,json"
            v-model="extensionsInput"
            @input="handleExtensionsInput"
          />
        </div>
        
        <div class="input-control">
          <label>排除模式:</label>
          <input 
            type="text" 
            placeholder="例如: node_modules,*.log"
            v-model="excludePatternsInput"
            @input="handleExcludePatternsInput"
          />
        </div>
      </div>
      
      <div class="option-group">
        <div class="input-control">
          <label>文件大小:</label>
          <input 
            type="text" 
            placeholder="例如: +100k, -10M"
            v-model="filenameSearchOptions.fileSize"
          />
        </div>
        
        <div class="input-control">
          <label>最近修改时间:</label>
          <input 
            type="text" 
            placeholder="例如: 1d, 2weeks"
            v-model="filenameSearchOptions.changedWithin"
          />
        </div>
        
        <div class="input-control">
          <label>之前修改时间:</label>
          <input 
            type="text" 
            placeholder="例如: 1d, 2weeks"
            v-model="filenameSearchOptions.changedBefore"
          />
        </div>
      </div>
    </div>
    
    <div class="dialog-footer">
      <button class="cancel-btn" @click="closeDialog">取消</button>
      <button class="confirm-btn" @click="closeDialog">确定</button>
    </div>
  </div>
</template>

<style scoped>
/* 对话框容器 */
.filename-advanced-options-dialog {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  width: 900px;
  max-width: 90vw;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  animation: slideIn 0.2s ease-out;
}

/* 对话框头部 */
.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  border-radius: 8px 8px 0 0;
}

.dialog-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

/* 关闭按钮 */
.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
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

/* 对话框内容 */
.dialog-content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 选项组 */
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

/* 选项标签 */
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

/* 深度控制 */
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
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
}

.depth-hint {
  font-size: 12px;
  color: var(--text-muted);
}

/* 输入控件 */
.input-control {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.input-control label {
  font-size: 13px;
  color: var(--text-secondary);
  min-width: 100px;
}

.input-control input {
  padding: 6px 8px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  flex: 1;
  transition: all 0.2s ease;
}

.input-control input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
}

/* 对话框底部 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  border-radius: 0 0 8px 8px;
}

/* 按钮样式 */
.cancel-btn {
  padding: 8px 16px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  transform: translateY(-1px);
}

.confirm-btn {
  padding: 8px 16px;
  background-color: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.confirm-btn:hover {
  background-color: var(--accent-hover);
  transform: translateY(-1px);
  box-shadow: 0 2px 6px rgba(57, 108, 216, 0.2);
}

/* 动画 */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .filename-advanced-options-dialog {
    width: 95vw;
    max-height: 90vh;
  }
  
  .option-group {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  
  .depth-control,
  .input-control {
    width: 100%;
  }
}
</style>
