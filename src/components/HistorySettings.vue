<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from 'vuex';
import { open } from '@tauri-apps/plugin-dialog';

const store = useStore();

// 历史记录路径设置
const historyPath = computed({
  get: () => store.state.history.historyPath,
  set: (value) => store.dispatch('history/setHistoryPath', value)
});

// 历史记录路径输入框的值
const historyPathInput = ref(store.state.history.historyPath || '');

// 打开目录选择器选择历史记录保存路径
async function selectHistoryPath() {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: "选择历史记录保存目录"
    });
    
    if (selected && typeof selected === 'string') {
      historyPathInput.value = selected;
      historyPath.value = selected;
    }
  } catch (error) {
    console.error('Failed to open directory picker:', error);
    alert('打开目录选择器失败，请检查应用权限');
  }
}

// 路径设置结果提示
const pathSettingResult = ref({ show: false, success: false, message: '' });

// 关闭提示
function closePathSettingResult() {
  pathSettingResult.value = { show: false, success: false, message: '' };
}

// 手动输入路径后确认设置
async function confirmHistoryPath() {
  const result = await store.dispatch('history/setHistoryPath', historyPathInput.value || null);
  pathSettingResult.value = { 
    show: true, 
    success: result.success, 
    message: result.message 
  };
  
  // 3秒后自动关闭提示
  setTimeout(closePathSettingResult, 3000);
}
</script>

<template>
  <div class="history-path-settings">
    <div class="settings-header">
      <h3>历史记录设置</h3>
    </div>
    <div class="path-setting">
      <label for="history-path">保存路径:</label>
      <div class="path-input-group">
        <input
          id="history-path"
          v-model="historyPathInput"
          type="text"
          placeholder="输入历史记录保存路径或点击选择按钮"
          class="path-input"
        />
        <button @click="selectHistoryPath" class="browse-btn">
          浏览
        </button>
        <button @click="confirmHistoryPath" class="confirm-btn">
          确认
        </button>
      </div>
      <div class="path-hint">
        当前保存路径: {{ historyPath || '未设置，使用默认路径' }}
      </div>
      
      <!-- 路径设置结果提示 -->
      <div 
        v-if="pathSettingResult.show" 
        class="setting-result"
        :class="{ 'success': pathSettingResult.success, 'error': !pathSettingResult.success }"
      >
        <span>{{ pathSettingResult.message }}</span>
        <button @click="closePathSettingResult" class="close-btn">&times;</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 历史记录路径设置样式 */
.history-path-settings {
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-color);
  padding: 12px 16px;
  margin-top: 12px;
  border-radius: 8px;
}

.settings-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.settings-header h3 {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text-primary);
}

.path-setting {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.path-setting label {
  font-size: 13px;
  color: var(--text-secondary);
  font-weight: 500;
}

.path-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
}

.path-input {
  flex: 1;
  min-width: 200px;
  padding: 6px 10px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  transition: all 0.2s ease;
}

.path-input:focus {
  border-color: var(--accent-color);
  box-shadow: 0 0 0 3px rgba(57, 108, 216, 0.1);
  outline: none;
}

.browse-btn, .confirm-btn {
  padding: 6px 12px;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.browse-btn:hover, .confirm-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  color: var(--text-primary);
}

.confirm-btn {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: white;
}

.confirm-btn:hover {
  background-color: var(--accent-hover);
  border-color: var(--accent-hover);
}

.path-hint {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 4px;
}

/* 设置结果提示 */
.setting-result {
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  animation: fadeIn 0.3s ease;
}

.setting-result.success {
  background-color: rgba(46, 204, 113, 0.1);
  color: #27ae60;
  border: 1px solid rgba(46, 204, 113, 0.3);
}

.setting-result.error {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.3);
}

.setting-result .close-btn {
  background: transparent;
  border: none;
  color: inherit;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: background-color 0.2s ease;
}

.setting-result .close-btn:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
