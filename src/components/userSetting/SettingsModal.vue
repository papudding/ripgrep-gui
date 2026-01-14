<script setup lang="ts">
import { ref, computed } from "vue";
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

// 文件关联配置
const activeTab = ref('general'); // general, fileAssociations
const fileAssociations = ref(store.state.config.userConfig.fileAssociations || []);
const newFileAssociation = ref({ extension: '', appPath: '' });
const editingAssociation = ref<{ extension: string; appPath: string } | null>(null);
const fileAssociationFilter = ref('');
const importExportError = ref('');
const importExportSuccess = ref('');

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
        language: language.value,
        fileAssociations: fileAssociations.value
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

// 添加文件关联
function addFileAssociation() {
  if (!newFileAssociation.value.extension.trim()) {
    errors.value.extension = '扩展名不能为空';
    return;
  }
  if (!newFileAssociation.value.appPath.trim()) {
    errors.value.appPath = '应用路径不能为空';
    return;
  }

  // 检查是否已存在相同扩展名的关联
  const existingIndex = fileAssociations.value.findIndex(
    assoc => assoc.extension.toLowerCase() === newFileAssociation.value.extension.toLowerCase()
  );

  if (existingIndex !== -1) {
    // 更新现有关联
    fileAssociations.value[existingIndex] = { ...newFileAssociation.value };
  } else {
    // 添加新关联
    fileAssociations.value.push({ ...newFileAssociation.value });
  }

  // 重置表单
  newFileAssociation.value = { extension: '', appPath: '' };
  delete errors.value.extension;
  delete errors.value.appPath;
}

// 编辑文件关联
function editFileAssociation(association: { extension: string; appPath: string }) {
  editingAssociation.value = { ...association };
}

// 保存编辑的文件关联
function saveEditedAssociation() {
  if (!editingAssociation.value) return;

  if (!editingAssociation.value.extension.trim()) {
    errors.value.editExtension = '扩展名不能为空';
    return;
  }
  if (!editingAssociation.value.appPath.trim()) {
    errors.value.editAppPath = '应用路径不能为空';
    return;
  }

  // 找到并更新关联
  const index = fileAssociations.value.findIndex(
    assoc => assoc.extension === editingAssociation.value!.extension
  );

  if (index !== -1) {
    fileAssociations.value[index] = { ...editingAssociation.value };
  }

  // 关闭编辑模式
  editingAssociation.value = null;
  delete errors.value.editExtension;
  delete errors.value.editAppPath;
}

// 取消编辑
function cancelEdit() {
  editingAssociation.value = null;
  delete errors.value.editExtension;
  delete errors.value.editAppPath;
}

// 删除文件关联
function deleteFileAssociation(extension: string) {
  fileAssociations.value = fileAssociations.value.filter(
    assoc => assoc.extension !== extension
  );
}

// 选择应用程序路径
async function selectAppPath(type: 'new' | 'edit') {
  try {
    const selected = await open({
      directory: false,
      multiple: false,
      title: '选择应用程序'
    });

    if (selected && typeof selected === 'string') {
      if (type === 'new') {
        newFileAssociation.value.appPath = selected;
        delete errors.value.appPath;
      } else if (editingAssociation.value) {
        editingAssociation.value.appPath = selected;
        delete errors.value.editAppPath;
      }
    }
  } catch (error) {
    console.error('Failed to open file picker:', error);
    alert('打开文件选择器失败，请检查应用权限');
  }
}

// 过滤后的文件关联
const filteredFileAssociations = computed(() => {
  if (!fileAssociationFilter.value) {
    return fileAssociations.value;
  }

  const filter = fileAssociationFilter.value.toLowerCase();
  return fileAssociations.value.filter(
    assoc => assoc.extension.toLowerCase().includes(filter)
  );
});

// 导出文件关联配置
function exportFileAssociations() {
  try {
    const dataStr = JSON.stringify(fileAssociations.value, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'file-associations.json';
    link.click();
    URL.revokeObjectURL(url);

    importExportSuccess.value = '文件关联配置导出成功';
    setTimeout(() => {
      importExportSuccess.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to export file associations:', error);
    importExportError.value = '导出失败: ' + (error instanceof Error ? error.message : String(error));
    setTimeout(() => {
      importExportError.value = '';
    }, 3000);
  }
}

// 导入文件关联配置
function importFileAssociations() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';

  input.onchange = async (e) => {
    const target = e.target as HTMLInputElement;
    if (!target.files || target.files.length === 0) return;

    try {
      const file = target.files[0];
      const text = await file.text();
      const importedAssociations = JSON.parse(text);

      if (Array.isArray(importedAssociations)) {
        // 验证导入的数据格式
        const validAssociations = importedAssociations.filter(
          (assoc: any) => assoc.extension && assoc.appPath
        );

        fileAssociations.value = validAssociations;
        importExportSuccess.value = '文件关联配置导入成功';
        setTimeout(() => {
          importExportSuccess.value = '';
        }, 3000);
      } else {
        throw new Error('无效的文件格式');
      }
    } catch (error) {
      console.error('Failed to import file associations:', error);
      importExportError.value = '导入失败: ' + (error instanceof Error ? error.message : String(error));
      setTimeout(() => {
        importExportError.value = '';
      }, 3000);
    }
  };

  input.click();
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

      <div class="modal-tabs">
        <button @click="activeTab = 'general'" class="tab-btn" :class="{ active: activeTab === 'general' }">
          基本设置
        </button>
        <button @click="activeTab = 'fileAssociations'" class="tab-btn"
          :class="{ active: activeTab === 'fileAssociations' }">
          文件关联
        </button>
        <button @click="activeTab = 'about'" class="tab-btn" :class="{ active: activeTab === 'about' }">
          关于
        </button>
      </div>

      <div class="modal-content">
        <form v-if="activeTab === 'general'" class="settings-form">
          <!-- 默认搜索路径 -->
          <div class="form-group">
            <label for="defaultSearchPath" class="form-label">默认搜索路径</label>
            <div class="input-with-button">
              <input id="defaultSearchPath" v-model="defaultSearchPath" type="text" class="form-input"
                placeholder="选择默认搜索目录" />
              <button type="button" @click="selectPath('default')" class="path-select-btn">
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
              <input id="historyPath" v-model="historyPath" type="text" class="form-input" placeholder="选择历史记录保存目录" />
              <button type="button" @click="selectPath('history')" class="path-select-btn">
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
                <input v-model="darkMode" type="checkbox" class="toggle-checkbox" />
                <span class="toggle-slider"></span>
              </div>
            </label>
          </div>

          <!-- 语言选择 -->
          <div class="form-group">
            <label for="language" class="form-label">语言</label>
            <select id="language" v-model="language" class="form-select">
              <option value="zh-CN">简体中文</option>
              <option value="en-US">English</option>
              <option value="ja-JP">日本語</option>
            </select>
            <div v-if="errors.language" class="error-message">
              {{ errors.language }}
            </div>
          </div>
        </form>

        <!-- 文件关联配置 -->
        <div v-else-if="activeTab === 'fileAssociations'" class="file-associations-tab">
          <!-- 导入/导出按钮 -->
          <div class="import-export-buttons">
            <button @click="importFileAssociations" class="import-btn">
              导入配置
            </button>
            <button @click="exportFileAssociations" class="export-btn">
              导出配置
            </button>
          </div>

          <!-- 导入/导出状态消息 -->
          <div v-if="importExportSuccess" class="success-message">
            {{ importExportSuccess }}
          </div>
          <div v-if="importExportError" class="error-message">
            {{ importExportError }}
          </div>

          <!-- 添加文件关联表单 -->
          <div class="add-file-association-form">
            <div class="add-btn-container">
              <h3>添加文件关联</h3>
              <button type="button" @click="addFileAssociation" class="add-btn">
                添加
              </button>
            </div>

            <div class="form-row">
              <div class="form-group">
                <label class="form-label">扩展名</label>
                <input v-model="newFileAssociation.extension" type="text" class="form-input" placeholder="例如：txt" />
                <div v-if="errors.extension" class="error-message">
                  {{ errors.extension }}
                </div>
              </div>
              <div class="form-group">
                <label class="form-label">默认应用</label>
                <div class="input-with-button">
                  <input v-model="newFileAssociation.appPath" type="text" class="form-input" placeholder="选择应用程序" />
                  <button type="button" @click="selectAppPath('new')" class="path-select-btn">
                    选择
                  </button>
                </div>
                <div v-if="errors.appPath" class="error-message">
                  {{ errors.appPath }}
                </div>
              </div>
            </div>
          </div>

          <!-- 文件关联列表 -->
          <div class="file-associations-list">
            <div class="file-association-search-container">
              <h3>已配置的文件关联</h3>
              <!-- 文件关联搜索 -->
              <div class="file-association-search">
                <input v-model="fileAssociationFilter" type="text" class="form-input" placeholder="搜索扩展名..." />
              </div>
            </div>
            <div v-if="filteredFileAssociations.length === 0" class="no-associations">
              <p>暂无文件关联配置</p>
            </div>
            <table v-else class="associations-table">
              <thead>
                <tr>
                  <th>扩展名</th>
                  <th>默认应用</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="association in filteredFileAssociations" :key="association.extension">
                  <td v-if="!editingAssociation || editingAssociation.extension !== association.extension">
                    {{ association.extension }}
                  </td>
                  <td v-else>
                    <input v-model="editingAssociation.extension" type="text" class="form-input" />
                    <div v-if="errors.editExtension" class="error-message">
                      {{ errors.editExtension }}
                    </div>
                  </td>
                  <td v-if="!editingAssociation || editingAssociation.extension !== association.extension">
                    {{ association.appPath }}
                  </td>
                  <td v-else>
                    <div class="input-with-button">
                      <input v-model="editingAssociation.appPath" type="text" class="form-input" />
                      <button type="button" @click="selectAppPath('edit')" class="path-select-btn">
                        选择
                      </button>
                    </div>
                    <div v-if="errors.editAppPath" class="error-message">
                      {{ errors.editAppPath }}
                    </div>
                  </td>
                  <td>
                    <div v-if="!editingAssociation || editingAssociation.extension !== association.extension"
                      class="association-actions">
                      <button @click="editFileAssociation(association)" class="edit-btn">
                        编辑
                      </button>
                      <button @click="deleteFileAssociation(association.extension)" class="delete-btn">
                        删除
                      </button>
                    </div>
                    <div v-else class="edit-actions">
                      <button @click="saveEditedAssociation" class="save-btn">
                        保存
                      </button>
                      <button @click="cancelEdit" class="cancel-btn">
                        取消
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- 保存状态 -->
        <div v-if="saveSuccess" class="success-message">
          配置保存成功！
        </div>
        <div v-if="errors.save" class="error-message">
          {{ errors.save }}
        </div>

        <!-- 关于标签页 -->
        <div v-else-if="activeTab === 'about'" class="about-tab">
          <div class="about-content">
            <div class="app-info">
              <h3>Ripgrep GUI</h3>
              <p class="app-description">一个基于 Tauri 和 Vue 3 的跨平台文件搜索工具</p>
              <p class="app-version">版本: 1.0.0</p>
            </div>
            
            <div class="author-info">
              <h4>作者信息</h4>
              <p>作者: papudding</p>
            </div>
            
            <div class="repository-info">
              <h4>项目信息</h4>
              <p>仓库地址: <a href="https://github.com/papudding/ripgrep-gui" target="_blank" rel="noopener noreferrer">https://github.com/papudding/ripgrep-gui</a></p>
            </div>
            
            <div class="technology-info">
              <h4>技术栈</h4>
              <ul class="tech-stack">
                <li>前端: Vue 3 + TypeScript + Vite</li>
                <li>后端: Rust + Tauri 2.0</li>
                <li>搜索引擎: Ripgrep</li>
              </ul>
            </div>
            
            <div class="license-info">
              <h4>许可证</h4>
              <p>MIT License</p>
            </div>
          </div>
        </div>
      </div>

      <div class="modal-footer">
        <button @click="closeModal" class="cancel-btn">
          取消
        </button>
        <button @click="saveConfig" class="save-btn" :disabled="isSaving">
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

/* 标签页样式 */
.modal-tabs {
  display: flex;
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
}

.tab-btn {
  padding: 12px 20px;
  background-color: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: var(--text-secondary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.tab-btn:hover {
  color: var(--text-primary);
  background-color: var(--bg-hover);
}

.tab-btn.active {
  color: var(--accent-color);
  border-bottom-color: var(--accent-color);
  background-color: var(--bg-primary);
}

/* 模态对话框 */
.settings-modal {
  background-color: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 800px;
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

/* 文件关联配置标签页样式 */
.file-associations-tab {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 导入/导出按钮 */
.import-export-buttons {
  display: flex;
  gap: 12px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.import-btn,
.export-btn {
  padding: 8px 16px;
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 6px;
  color: var(--text-primary);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  flex: 1;
  min-width: 120px;
  text-align: center;
}

.import-btn:hover,
.export-btn:hover {
  background-color: var(--bg-hover);
  border-color: var(--border-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 文件关联搜索 */
.file-association-search {
  margin-bottom: 10px;
  margin-left: auto;
}

/* 添加文件关联表单 */
.add-file-association-form {
  background-color: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.add-btn-container {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-direction: row;
}

.add-file-association-form h3,
.file-associations-list h3 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 16px 0
}

.file-association-search-container {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-direction: row;
}

.form-row {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  flex-direction: column;
}

.form-row .form-group {
  flex: 1;
  min-width: 200px;
}

.add-btn {
  padding: 8px 12px;
  background-color: var(--accent-color);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
}

.add-btn:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 4px 12px rgba(57, 108, 216, 0.25);
}

/* 文件关联列表 */
.file-associations-list {
  background-color: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  overflow-x: auto;
}

.no-associations {
  text-align: center;
  padding: 40px 20px;
  color: var(--text-secondary);
  font-size: 14px;
}

.associations-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
  min-width: 600px;
}

.associations-table th,
.associations-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  vertical-align: middle;
}

.associations-table th {
  background-color: var(--bg-primary);
  font-weight: 600;
  color: var(--text-primary);
  white-space: nowrap;
}

.associations-table td {
  font-size: 14px;
}

.associations-table tr:hover {
  background-color: var(--bg-hover);
}

/* 操作按钮 */
.association-actions,
.edit-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.edit-btn,
.delete-btn,
.save-btn,
.cancel-btn {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 60px;
  text-align: center;
}

.edit-btn {
  background-color: var(--accent-light);
  color: var(--accent-color);
}

.edit-btn:hover {
  background-color: var(--accent-color);
  color: white;
  box-shadow: 0 2px 8px rgba(57, 108, 216, 0.2);
}

.delete-btn {
  background-color: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border: 1px solid rgba(231, 76, 60, 0.2);
}

.delete-btn:hover {
  background-color: #e74c3c;
  color: white;
  box-shadow: 0 2px 8px rgba(231, 76, 60, 0.2);
}

.save-btn {
  background-color: var(--accent-color);
  color: white;
}

.save-btn:hover {
  background-color: var(--accent-hover);
  box-shadow: 0 2px 8px rgba(57, 108, 216, 0.2);
}

.cancel-btn {
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
}

.cancel-btn:hover {
  background-color: var(--bg-hover);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row .form-group {
    min-width: unset;
  }

  .add-button-group {
    min-width: unset;
  }

  .import-export-buttons {
    flex-direction: column;
  }

  .import-btn,
  .export-btn {
    flex: unset;
    width: 100%;
  }

  .associations-table {
    font-size: 12px;
    min-width: unset;
  }

  .associations-table th,
  .associations-table td {
    padding: 8px;
    font-size: 12px;
  }

  .association-actions,
  .edit-actions {
    flex-direction: column;
  }

  .edit-btn,
  .delete-btn,
  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}

/* 小屏幕设备 */
@media (max-width: 480px) {
  .settings-modal {
    width: 98%;
    max-height: 95vh;
  }

  .modal-header h2 {
    font-size: 16px;
  }

  .tab-btn {
    padding: 10px 12px;
    font-size: 13px;
  }

  .form-label {
    font-size: 13px;
  }

  .form-input,
  .form-select {
    font-size: 13px;
    padding: 8px 10px;
  }

  .add-file-association-form h3,
  .file-associations-list h3 {
    font-size: 14px;
  }

  .no-associations {
    padding: 20px 10px;
    font-size: 13px;
  }
}

/* 关于标签页样式 */
.about-tab {
  padding: 20px;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.app-info {
  text-align: center;
  padding: 20px;
  background-color: var(--bg-secondary);
  border-radius: 12px;
  border: 1px solid var(--border-color);
}

.app-info h3 {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
}

.app-description {
  font-size: 16px;
  color: var(--text-secondary);
  margin: 0 0 12px 0;
}

.app-version {
  font-size: 14px;
  color: var(--accent-color);
  font-weight: 500;
  margin: 0;
}

.author-info,
.repository-info,
.technology-info,
.license-info {
  background-color: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

.author-info h4,
.repository-info h4,
.technology-info h4,
.license-info h4 {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--border-color);
}

.author-info p,
.repository-info p,
.license-info p {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.5;
}

.repository-info a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.repository-info a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
}

.tech-stack {
  font-size: 14px;
  color: var(--text-primary);
  margin: 0;
  padding-left: 20px;
  line-height: 1.6;
}

.tech-stack li {
  margin-bottom: 6px;
}

.tech-stack li:last-child {
  margin-bottom: 0;
}

/* 关于标签页响应式样式 */
@media (max-width: 768px) {
  .about-content {
    gap: 16px;
  }

  .app-info {
    padding: 16px;
  }

  .app-info h3 {
    font-size: 20px;
  }

  .app-description {
    font-size: 14px;
  }

  .author-info,
  .repository-info,
  .technology-info,
  .license-info {
    padding: 12px;
  }

  .author-info h4,
  .repository-info h4,
  .technology-info h4,
  .license-info h4 {
    font-size: 14px;
  }

  .author-info p,
  .repository-info p,
  .license-info p,
  .tech-stack {
    font-size: 13px;
  }
}

@media (max-width: 480px) {
  .about-tab {
    padding: 12px;
  }

  .app-info h3 {
    font-size: 18px;
  }

  .app-description {
    font-size: 13px;
  }

  .app-version {
    font-size: 12px;
  }
}
</style>