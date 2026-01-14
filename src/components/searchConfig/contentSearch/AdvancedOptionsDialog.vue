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

// 计算属性：处理数组和字符串之间的转换
const includePatterns = computed({
  get: () => contentSearchOptions.value.include.join(','),
  set: (value) => {
    contentSearchOptions.value.include = value.split(',').map(item => item.trim()).filter(item => item);
  }
});

const excludePatterns = computed({
  get: () => contentSearchOptions.value.exclude.join(','),
  set: (value) => {
    contentSearchOptions.value.exclude = value.split(',').map(item => item.trim()).filter(item => item);
  }
});

const fileTypes = computed({
  get: () => contentSearchOptions.value.fileTypes.join(','),
  set: (value) => {
    contentSearchOptions.value.fileTypes = value.split(',').map(item => item.trim()).filter(item => item);
  }
});

const fileTypesNot = computed({
  get: () => contentSearchOptions.value.fileTypesNot.join(','),
  set: (value) => {
    contentSearchOptions.value.fileTypesNot = value.split(',').map(item => item.trim()).filter(item => item);
  }
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
      <div class="option-groups-container">
        <!-- 搜索模式相关选项 -->
        <div class="option-group">
          <h4>搜索模式</h4>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.fixedStrings" />
            固定字符串模式（非正则）
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.invertMatch" />
            反转匹配（显示不匹配的行）
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.lineRegexp" />
            整行匹配
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.smartCase" />
            智能大小写（全小写模式时不敏感）
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.text" />
            搜索二进制文件作为文本
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.multiline" />
            多行搜索
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.multilineDotall" />
            多行搜索时 . 匹配换行符
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.pcre2" />
            使用 PCRE2 正则引擎
          </label>
        </div>

        <!-- 文件过滤相关选项 -->
        <div class="option-group">
          <h4>文件过滤</h4>

          <div class="text-input-group">
            <label>包含的文件模式:</label>
            <input type="text" v-model="includePatterns" placeholder="例如: *.js,*.ts" />
          </div>

          <div class="text-input-group">
            <label>排除的文件模式:</label>
            <input type="text" v-model="excludePatterns" placeholder="例如: *.log,*.tmp" />
          </div>

          <div class="text-input-group">
            <label>包含的文件类型:</label>
            <input type="text" v-model="fileTypes" placeholder="例如: javascript,typescript" />
          </div>

          <div class="text-input-group">
            <label>排除的文件类型:</label>
            <input type="text" v-model="fileTypesNot" placeholder="例如: json,xml" />
          </div>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.noIgnore" />
            不使用 ignore 文件
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.noIgnoreVcs" />
            不忽略 VCS 文件
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.followSymlinks" />
            跟随符号链接
          </label>
        </div>

        <!-- 搜索行为相关选项 -->
        <div class="option-group">
          <h4>搜索行为</h4>

          <div class="number-input-group">
            <label>最小搜索深度:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.minDepth" />
            <span class="hint">(0 = 无限制)</span>
          </div>

          <div class="number-input-group">
            <label>最大搜索深度:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.maxDepth" />
            <span class="hint">(0 = 无限制)</span>
          </div>

          <div class="number-input-group">
            <label>使用的线程数:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.threads" />
            <span class="hint">(0 = 自动)</span>
          </div>

          <div class="number-input-group">
            <label>每个文件的最大匹配数:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.maxCount" />
            <span class="hint">(0 = 无限制)</span>
          </div>
        </div>

        <!-- 输出相关选项 -->
        <div class="option-group">
          <h4>输出选项</h4>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.lineNumber" />
            显示行号
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.withFilename" />
            显示文件名
          </label>

          <div class="number-input-group">
            <label>显示匹配上下文行数:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.context" />
          </div>

          <div class="number-input-group">
            <label>显示匹配后上下文行数:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.afterContext" />
          </div>

          <div class="number-input-group">
            <label>显示匹配前上下文行数:</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.beforeContext" />
          </div>
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
  max-width: 900px;
  max-height: 80vh;
  overflow-y: auto;
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

/* 选项组容器 */
.option-groups-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
}

/* 选项组 */
.option-group {
  flex: 1 1 calc(50% - 10px);
  min-width: 300px;
  margin-bottom: 0;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-color);
}

.option-group:nth-last-child(1),
.option-group:nth-last-child(2) {
  border-bottom: none;
}

/* 选项组标题 */
.option-group h4 {
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 选项标签 */
.option-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-size: 14px;
  color: var(--text-primary);
  cursor: pointer;
}

.option-label input[type="checkbox"] {
  margin: 0;
}

/* 文本输入组 */
.text-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.text-input-group label {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.text-input-group input {
  flex: 1;
  min-width: 200px;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  box-sizing: border-box;
}

.text-input-group input:focus {
  outline: none;
  border-color: var(--border-hover);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* 数字输入组 */
.number-input-group {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.number-input-group label {
  font-size: 14px;
  color: var(--text-primary);
  white-space: nowrap;
  flex-shrink: 0;
}

.number-input-group input {
  padding: 6px 8px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 14px;
  width: 80px;
}

.number-input-group input:focus {
  outline: none;
  border-color: var(--border-hover);
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.05);
}

/* 提示文本 */
.hint {
  font-size: 12px;
  color: var(--text-secondary);
  flex-shrink: 0;
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
  padding: 8px 16px;
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

/* 滚动条样式 */
.dialog-content::-webkit-scrollbar {
  width: 6px;
}

.dialog-content::-webkit-scrollbar-track {
  background: var(--bg-secondary);
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 3px;
}

.dialog-content::-webkit-scrollbar-thumb:hover {
  background: var(--border-hover);
}
</style>
