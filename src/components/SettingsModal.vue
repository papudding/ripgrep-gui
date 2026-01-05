<script setup lang="ts">
import { ref } from "vue";
import { useStore } from 'vuex';
import { open } from '@tauri-apps/plugin-dialog';

const store = useStore();

// 定义组件属性
defineProps<{
  visible: boolean;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'save'): void;
}>();

// 配置项
const defaultSearchPath = ref(store.state.config.defaultSearchPath);
const historyPath = ref(store.state.config.historyPath);
const darkMode = ref(store.state.config.userConfig.darkMode);
const language = ref(store.state.config.userConfig.language);

// 表单验证错误
const errors = ref<Record<string, string>>({});

// 保存状态
const isSaving = ref(false);
const saveSuccess = ref(false);

// 打开目录选择器
async function selectPath(type: 'default' | 'history') {
  try {
    const selected = await open({
      directory: true,
      multiple: false,
      title: type === 'default' ? '选择默认搜索目录' : '选择历史记录保存目录'
    });
    
    if (selected && typeof selected === 'string') {
      if (type === 'default') {
        defaultSearchPath.value = selected;
      } else {
        historyPath.value = selected;
      }
      // 清除对应字段的错误
      delete errors.value[type === 'default' ? 'defaultSearchPath' : 'historyPath'];
    }
  } catch (error) {
    console.error('Failed to open directory picker:', error);
    alert('打开目录选择器失败，请检查应用权限');
  }
}

// 表单验证
function validateForm() {
  const newErrors: Record<string, string> = {};
  
  // 验证默认搜索路径（可选）
  if (defaultSearchPath.value && !defaultSearchPath.value.trim()) {
    newErrors.defaultSearchPath = '默认搜索路径不能为空';
  }
  
  // 验证历史记录路径（可选）
  if (historyPath.value && !historyPath.value.trim()) {
    newErrors.historyPath = '历史记录路径不能为空';
  }
  
  // 验证语言
  if (!language.value || !language.value.trim()) {
    newErrors.language = '语言不能为空';
  }
  
  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

// 保存配置
async function saveConfig() {
  if (!validateForm()) {
    return;
  }
  
  isSaving.value = true;
  saveSuccess.value = false;
  
  try {
    // 更新配置
    await store.dispatch('config/updateConfig', {
      defaultSearchPath: defaultSearchPath.value,
      historyPath: historyPath.value,
      userConfig: {
        darkMode: darkMode.value,
        language: language.value
      }
    });
    
    saveSuccess.value = true;
    setTimeout(() => {
      saveSuccess.value = false;
      emit('save');
      emit('close');
    }, 1000);
  } catch (error) {
    console.error('保存配置失败:', error);
    errors.value.save = `保存失败: ${error instanceof Error ? error.message : String(error)}`;
  } finally {
    isSaving.value = false;
  }
}

// 关闭对话框
function closeModal() {
  emit('close');
}
</script>

<template>
  <div v-if="visible" class="settings-modal-overlay">
    <div class="settings-modal">
      <div class="modal-header">
        <h2>设置</h2>
        <button @click="closeModal" class="close-btn">
          &times;
        </button>
      </div>
      
      <div class="modal-content">
        <form class="settings-form">
          <!-- 默认搜索路径 -->
          <div class="form-group">
            <label for="defaultSearchPath" class="form-label">默认搜索路径</label>
            <div class="input-with-button">
              <input
                id="defaultSearchPath"
                v-model="defaultSearchPath"
                type="text"
                class="form-input"
                placeholder="选择默认搜索目录"
              />
              <button 
                type="button" 
                @click="selectPath('default')"
                class="path-select-btn"
              >
                选择
              </button>
            </div>
            <div v-if="errors.defaultSearchPath" class="error-message">
              {{ errors.defaultSearchPath }}
            </div>
          </div>
          
          <!-- 历史记录保存路径 -->
          <div class="form-group">
            <label for="historyPath" class="form-label">历史记录保存路径</label>
            <div class="input-with-button">
              <input
                id="historyPath"
                v-model="historyPath"
                type="text"
                class="form-input"
                placeholder="选择历史记录保存目录"
              />
              <button 
                type="button" 
                @click="selectPath('history')"
                class="path-select-btn"
              >
                选择
              </button>
            </div>
            <div v-if="errors.historyPath" class="error-message">
              {{ errors.historyPath }}
            </div>
          </div>
          
          <!-- 深色模式 -->
          <div class="form-group">
            <label class="toggle-label">
              <span>深色模式</span>
              <div class="toggle-switch">
                <input
                  v-model="darkMode"
                  type="checkbox"
                  class="toggle-checkbox"
                />
                <span class="toggle-slider"></span>
              </div>
            </label>
          </div>
          
          <!-- 语言选择 -->
          <div class="form-group">
            <label for="language" class="form-label">语言</label>
            <select
              id="language"
              v-model="language"
              class="form-select"
            >
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
            <div v-if="errors.language" class="error-message">
              {{ errors.language }}
            </div>
          </div>
        </form>
        
        <!-- 保存状态 -->
        <div v-if="saveSuccess" class="success-message">
          配置保存成功！
        </div>
        <div v-if="errors.save" class="error-message">
          {{ errors.save }}
        </div>
      </div>
      
      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn">
          取消
        </button>
        <button 
          @click="saveConfig" 
          class="save-btn"
          :disabled="isSaving"
        >
          {{ isSaving ? '保存中...' : '保存' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 模态对话框遮罩 */
.settings-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn 0.3s ease;
}

/* 模态对话框 */
.settings-modal {
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
  animation: slideUp 0.3s ease;
}

/* 动画效果 */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* 对话框头部 */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0;
  width: 30px;
  height: 30px;
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
.modal-content {
  padding: 20px;
}

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
}

.input-with-button .form-input {
  flex: 1;
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

.toggle-checkbox:checked + .toggle-slider {
  background-color: var(--accent-color);
}

.toggle-checkbox:checked + .toggle-slider:before {
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

/* 成功信息 */
.success-message {
  font-size: 14px;
  color: #27ae60;
  margin-top: 16px;
  padding: 10px;
  background-color: rgba(39, 174, 96, 0.1);
  border-radius: 8px;
  text-align: center;
}

/* 对话框底部 */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid var(--border-color);
}

/* 按钮样式 */
.cancel-btn {
  padding: 10px 20px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.cancel-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
}

.save-btn {
  padding: 10px 20px;
  background-color: var(--accent-color);
  border: none;
  border-radius: 8px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.save-btn:hover:not(:disabled) {
  background-color: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(57, 108, 216, 0.25);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .settings-modal {
    width: 95%;
    max-height: 90vh;
  }
  
  .modal-header,
  .modal-content,
  .modal-footer {
    padding: 16px;
  }
  
  .input-with-button {
    flex-direction: column;
  }
}
</style>