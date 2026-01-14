<script setup lang="ts">
import { ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { open } from '@tauri-apps/plugin-dialog';
import i18n from '../../../i18n';

const { t } = useI18n();

const store = useStore();

// 内部状态定义
const defaultSearchPath = ref(store.state.config.defaultSearchPath || '');
const historyPath = ref(store.state.config.historyPath || '');
const logPath = ref(store.state.config.userConfig.logPath || '');
const darkMode = ref(store.state.config.userConfig.darkMode || false);
const language = ref(store.state.config.userConfig.language || 'zh-CN');
const errors = ref<Record<string, string>>({});
const showRestartHint = ref(false);

// 监听状态变化并同步到store
watch(defaultSearchPath, (newValue) => {
  store.dispatch('config/updateUserConfig', {
    ...store.state.config.userConfig,
    defaultSearchPath: newValue
  });
});

watch(historyPath, (newValue) => {
  store.dispatch('config/updateUserConfig', {
    ...store.state.config.userConfig,
    historyPath: newValue
  });
});

watch(darkMode, (newValue) => {
  store.dispatch('config/updateUserConfig', {
    ...store.state.config.userConfig,
    darkMode: newValue
  });
});

watch(language, (newValue) => {
  // 更新i18n语言
  i18n.global.locale.value = newValue;
  // 保存到localStorage
  localStorage.setItem('language', newValue);
  // 更新store配置
  store.dispatch('config/updateUserConfig', {
    ...store.state.config.userConfig,
    language: newValue
  });
});

watch(logPath, (newValue) => {
  store.dispatch('config/updateUserConfig', {
    ...store.state.config.userConfig,
    logPath: newValue
  });
 showRestartHint.value = true; 
  
});

// 选择路径的方法
const selectPath = async (type: 'default' | 'history' | 'log') => {
  try {
    let title = '';
    if (type === 'default') {
      title = t('settings.generalSettings.dialogTitles.defaultSearchPath');
    } else if (type === 'history') {
      title = t('settings.generalSettings.dialogTitles.historyPath');
    } else {
      title = t('settings.generalSettings.dialogTitles.logPath');
    }
    const selected = await open({
      directory: true,
      multiple: false,
      title: title
    });

    if (selected && typeof selected === 'string') {
      if (type === 'default') {
        defaultSearchPath.value = selected;
      } else if (type === 'history') {
        historyPath.value = selected;
      } else {
        logPath.value = selected;
      }
    }
  } catch (error) {
    console.error('选择路径失败:', error);
  }
};
</script>

<template>
  <form class="settings-form">
    <!-- 默认搜索路径 -->
    <div class="form-group">
      <label for="defaultSearchPath" class="form-label">{{ t('settings.generalSettings.defaultSearchPath') }}</label>
      <div class="input-with-button">
        <input id="defaultSearchPath" v-model="defaultSearchPath" type="text" class="form-input"
          :placeholder="t('settings.generalSettings.placeholders.defaultSearchPath')" />
        <button type="button" @click="selectPath('default')" class="path-select-btn">
          {{ t('settings.generalSettings.selectPath') }}
        </button>
      </div>
      <div v-if="errors.defaultSearchPath" class="error-message">
        {{ errors.defaultSearchPath }}
      </div>
    </div>

    <!-- 历史记录保存路径 -->
    <div class="form-group">
      <label for="historyPath" class="form-label">{{ t('settings.generalSettings.historyPath') }}</label>
      <div class="input-with-button">
        <input id="historyPath" v-model="historyPath" type="text" class="form-input" :placeholder="t('settings.generalSettings.placeholders.historyPath')" />
        <button type="button" @click="selectPath('history')" class="path-select-btn">
          {{ t('settings.generalSettings.selectPath') }}
        </button>
      </div>
      <div v-if="errors.historyPath" class="error-message">
        {{ errors.historyPath }}
      </div>
    </div>

    <!-- 日志保存路径 -->
    <div class="form-group">
      <label for="logPath" class="form-label">{{ t('settings.generalSettings.logPath') }}</label>
      <div class="input-with-button">
        <input id="logPath" v-model="logPath" type="text" class="form-input" :placeholder="t('settings.generalSettings.placeholders.logPath')" />
        <button type="button" @click="selectPath('log')" class="path-select-btn">
          {{ t('settings.generalSettings.selectPath') }}
        </button>
      </div>
      <div v-if="errors.logPath" class="error-message">
        {{ errors.logPath }}
      </div>
      <div v-if="showRestartHint" class="restart-hint">
        {{ t('settings.generalSettings.restartHint') }}
      </div>
    </div>

    <!-- 深色模式 -->
    <div class="form-group">
      <label class="toggle-label">
        <span>{{ t('settings.darkMode') }}</span>
        <div class="toggle-switch">
          <input v-model="darkMode" type="checkbox" class="toggle-checkbox" />
          <span class="toggle-slider"></span>
        </div>
      </label>
    </div>

    <!-- 语言选择 -->
    <div class="form-group">
      <label for="language" class="form-label">{{ t('settings.language') }}</label>
      <select id="language" v-model="language" class="form-select">
        <option value="zh-CN">{{ t('settings.generalSettings.languages.zhCN') }}</option>
        <option value="en">{{ t('settings.generalSettings.languages.en') }}</option>
      </select>
      <div v-if="errors.language" class="error-message">
        {{ errors.language }}
      </div>
    </div>
  </form>
</template>

<style scoped>
/* 设置表单 */
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 表单组 */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
}

/* 输入框样式 */
.form-input {
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-light);
}

/* 输入框带按钮 */
.input-with-button {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.input-with-button .form-input {
  flex: 1;
  min-width: 150px;
}

/* 路径选择按钮 */
.path-select-btn {
  padding: 10px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 80px;
}

/* 确保选择按钮在小屏幕上换行 */
@media (max-width: 768px) {
  .input-with-button {
    flex-direction: column;
  }

  .path-select-btn {
    width: 100%;
  }
}

.path-select-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

/* 切换开关 */
.toggle-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  padding: 8px 0;
}

.toggle-switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 26px;
}

.toggle-checkbox {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--border-color);
  transition: .4s;
  border-radius: 26px;
}

.toggle-slider:before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 3px;
  bottom: 3px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

.toggle-checkbox:checked+.toggle-slider {
  background-color: var(--accent-color);
}

.toggle-checkbox:checked+.toggle-slider:before {
  transform: translateX(24px);
}

/* 下拉选择框 */
.form-select {
  padding: 10px 12px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.form-select:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px var(--accent-light);
}

/* 错误信息 */
.error-message {
  font-size: 12px;
  color: #e74c3c;
  margin-top: 4px;
}

/* 重启提示 */
.restart-hint {
  font-size: 12px;
  color: #f39c12;
  margin-top: 4px;
  padding: 6px 8px;
  background-color: rgba(243, 156, 18, 0.1);
  border-radius: 4px;
  border-left: 3px solid #f39c12;
}
</style>
