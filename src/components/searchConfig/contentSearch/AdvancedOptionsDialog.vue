<script setup lang="ts">
import { computed } from "vue";
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
      <h3>{{ t('search.advancedOptions.contentSearchTitle') }}</h3>
      <button class="dialog-close" @click="closeDialog">&times;</button>
    </div>

    <div class="dialog-body">
      <div class="option-groups-container">
        <!-- 搜索模式相关选项 -->
        <div class="option-group">
          <h4>{{ t('search.advancedOptions.searchMode') }}</h4>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.fixedStrings" />
            {{ t('search.advancedOptions.fixedStrings') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.invertMatch" />
            {{ t('search.advancedOptions.invertMatch') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.lineRegexp" />
            {{ t('search.advancedOptions.lineRegexp') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.smartCase" />
            {{ t('search.advancedOptions.smartCase') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.text" />
            {{ t('search.advancedOptions.text') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.multiline" />
            {{ t('search.advancedOptions.multiline') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.multilineDotall" />
            {{ t('search.advancedOptions.multilineDotall') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.pcre2" />
            {{ t('search.advancedOptions.pcre2') }}
          </label>
        </div>

        <!-- 文件过滤相关选项 -->
        <div class="option-group">
          <h4>{{ t('search.advancedOptions.fileFilter') }}</h4>

          <div class="text-input-group">
            <label>{{ t('search.advancedOptions.includePatterns') }}</label>
            <input type="text" v-model="includePatterns" :placeholder="t('placeholders.exampleFilePatterns')" />
          </div>

          <div class="text-input-group">
            <label>{{ t('search.advancedOptions.excludePatterns') }}</label>
            <input type="text" v-model="excludePatterns" :placeholder="t('placeholders.exampleLogPatterns')" />
          </div>

          <div class="text-input-group">
            <label>{{ t('search.advancedOptions.fileTypes') }}</label>
            <input type="text" v-model="fileTypes" :placeholder="t('placeholders.exampleFileTypes')" />
          </div>

          <div class="text-input-group">
            <label>{{ t('search.advancedOptions.fileTypesNot') }}</label>
            <input type="text" v-model="fileTypesNot" :placeholder="t('placeholders.exampleExcludeTypes')" />
          </div>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.noIgnore" />
            {{ t('search.advancedOptions.noIgnore') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.noIgnoreVcs" />
            {{ t('search.advancedOptions.noIgnoreVcs') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.followSymlinks" />
            {{ t('search.advancedOptions.followSymlinks') }}
          </label>
        </div>

        <!-- 搜索行为相关选项 -->
        <div class="option-group">
          <h4>{{ t('search.advancedOptions.searchBehavior') }}</h4>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.minDepth') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.minDepth" />
            <span class="hint">{{ t('search.advancedOptions.unlimited') }}</span>
          </div>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.maxDepth') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.maxDepth" />
            <span class="hint">{{ t('search.advancedOptions.unlimited') }}</span>
          </div>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.threads') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.threads" />
            <span class="hint">{{ t('search.advancedOptions.auto') }}</span>
          </div>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.maxCount') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.maxCount" />
            <span class="hint">{{ t('search.advancedOptions.unlimited') }}</span>
          </div>
        </div>

        <!-- 输出相关选项 -->
        <div class="option-group">
          <h4>{{ t('search.advancedOptions.outputOptions') }}</h4>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.lineNumber" />
            {{ t('search.advancedOptions.lineNumber') }}
          </label>

          <label class="option-label">
            <input type="checkbox" v-model="contentSearchOptions.withFilename" />
            {{ t('search.advancedOptions.withFilename') }}
          </label>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.context') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.context" />
          </div>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.afterContext') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.afterContext" />
          </div>

          <div class="number-input-group">
            <label>{{ t('search.advancedOptions.beforeContext') }}</label>
            <input type="number" min="0" v-model.number="contentSearchOptions.beforeContext" />
          </div>
        </div>
      </div>
    </div>

    <div class="dialog-footer">
      <button class="dialog-button" @click="closeDialog">{{ t('search.advancedOptions.close') }}</button>
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
