<script setup lang="ts">
import { ref, computed } from "vue";
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { open } from '@tauri-apps/plugin-dialog';

const { t } = useI18n();

const store = useStore();

// 内部状态定义
const fileAssociations = ref(store.state.config.userConfig.fileAssociations || []);
const newFileAssociation = ref({ extension: '', appPath: '' });
const editingAssociation = ref<{ extension: string; appPath: string } | null>(null);
const fileAssociationFilter = ref('');
const importExportError = ref('');
const importExportSuccess = ref('');
const errors = ref<Record<string, string>>({});

const emit = defineEmits<{
  (e: 'update:fileAssociations', value: Array<{ extension: string; appPath: string }>): void;
  (e: 'update:errors', value: Record<string, string>): void;
}>();

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

// 添加文件关联
function addFileAssociation() {
  if (!newFileAssociation.value.extension.trim()) {
    errors.value.extension = t('error.extensionRequired');
    emit('update:errors', errors.value);
    return;
  }
  if (!newFileAssociation.value.appPath.trim()) {
    errors.value.appPath = t('error.appPathRequired');
    emit('update:errors', errors.value);
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
  emit('update:errors', errors.value);
  emit('update:fileAssociations', fileAssociations.value);
}

// 编辑文件关联
function editFileAssociation(association: { extension: string; appPath: string }) {
  editingAssociation.value = { ...association };
}

// 保存编辑的文件关联
function saveEditedAssociation() {
  if (!editingAssociation.value) return;

  if (!editingAssociation.value.extension.trim()) {
    errors.value.editExtension = t('error.extensionRequired');
    emit('update:errors', errors.value);
    return;
  }
  if (!editingAssociation.value.appPath.trim()) {
    errors.value.editAppPath = t('error.appPathRequired');
    emit('update:errors', errors.value);
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
  emit('update:errors', errors.value);
  emit('update:fileAssociations', fileAssociations.value);
}

// 取消编辑
function cancelEdit() {
  editingAssociation.value = null;
  delete errors.value.editExtension;
  delete errors.value.editAppPath;
  emit('update:errors', errors.value);
}

// 删除文件关联
function deleteFileAssociation(extension: string) {
  fileAssociations.value = fileAssociations.value.filter(
    assoc => assoc.extension !== extension
  );
  emit('update:fileAssociations', fileAssociations.value);
}

// 选择应用程序路径
async function selectAppPath(type: 'new' | 'edit') {
  try {
    const selected = await open({
      directory: false,
      multiple: false,
      title: t('fileAssociations.selectApp')
    });

    if (selected && typeof selected === 'string') {
      if (type === 'new') {
        newFileAssociation.value.appPath = selected;
      } else if (editingAssociation.value) {
        editingAssociation.value.appPath = selected;
      }
      // 清除对应字段的错误
      delete errors.value[type === 'new' ? 'appPath' : 'editAppPath'];
      emit('update:errors', errors.value);
    }
  } catch (error) {
    console.error('Failed to open file picker:', error);
    alert('打开文件选择器失败，请检查应用权限');
  }
}

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

    importExportSuccess.value = t('fileAssociations.exportSuccess');
    setTimeout(() => {
      importExportSuccess.value = '';
    }, 3000);
  } catch (error) {
    console.error('Failed to export file associations:', error);
    importExportError.value = t('fileAssociations.exportFailed', { error: error instanceof Error ? error.message : String(error) });
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
        importExportSuccess.value = t('fileAssociations.importSuccess');
        setTimeout(() => {
          importExportSuccess.value = '';
        }, 3000);
        emit('update:fileAssociations', fileAssociations.value);
      } else {
        throw new Error(t('error.invalidFileFormat'));
      }
    } catch (error) {
      console.error('Failed to import file associations:', error);
      importExportError.value = t('fileAssociations.importFailed', { error: error instanceof Error ? error.message : String(error) });
      setTimeout(() => {
        importExportError.value = '';
      }, 3000);
    }
  };

  input.click();
}
</script>

<template>
  <div class="file-associations-tab">
    <!-- 导入/导出按钮 -->
    <div class="import-export-buttons">
      <button @click="importFileAssociations" class="import-btn">
        {{ t('fileAssociations.importConfig') }}
      </button>
      <button @click="exportFileAssociations" class="export-btn">
        {{ t('fileAssociations.exportConfig') }}
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
        <h3>{{ t('fileAssociations.addFileAssociation') }}</h3>
        <button type="button" @click="addFileAssociation" class="add-btn">
          {{ t('fileAssociations.add') }}
        </button>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label class="form-label">{{ t('fileAssociations.extension') }}</label>
          <input v-model="newFileAssociation.extension" type="text" class="form-input" :placeholder="t('fileAssociations.extensionPlaceholder')" />
          <div v-if="errors.extension" class="error-message">
            {{ errors.extension }}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t('fileAssociations.defaultApp') }}</label>
          <div class="input-with-button">
            <input v-model="newFileAssociation.appPath" type="text" class="form-input" :placeholder="t('fileAssociations.selectApp')" />
            <button type="button" @click="selectAppPath('new')" class="path-select-btn">
              {{ t('fileAssociations.select') }}
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
        <h3>{{ t('fileAssociations.selectedFileAssociations') }}</h3>
        <!-- 文件关联搜索 -->
        <div class="file-association-search">
          <input v-model="fileAssociationFilter" type="text" :placeholder="t('fileAssociations.searchExtension')" class="form-input" />
        </div>
      </div>
      <div v-if="filteredFileAssociations.length === 0" class="no-associations">
        <p>{{ t('fileAssociations.noAssociations') }}</p>
      </div>
      <table v-else class="associations-table">
        <thead>
          <tr>
            <th>{{ t('fileAssociations.extension') }}</th>
            <th>{{ t('fileAssociations.defaultApp') }}</th>
            <th>{{ t('fileAssociations.actions') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="association in filteredFileAssociations" :key="association.extension">
            <td v-if="!editingAssociation || editingAssociation.extension !== association.extension">
              {{ association.extension }}
            </td>
            <td v-else>
              <input v-model="editingAssociation.extension" type="text" class="form-input" :placeholder="t('fileAssociations.extensionPlaceholder')" />
              <div v-if="errors.editExtension" class="error-message">
                {{ errors.editExtension }}
              </div>
            </td>
            <td v-if="!editingAssociation || editingAssociation.extension !== association.extension">
              {{ association.appPath }}
            </td>
            <td v-else>
              <div class="input-with-button">
                <input v-model="editingAssociation.appPath" type="text" class="form-input" :placeholder="t('fileAssociations.selectApp')" />
                <button type="button" @click="selectAppPath('edit')" class="path-select-btn">
                  {{ t('fileAssociations.select') }}
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
                  {{ t('fileAssociations.edit') }}
                </button>
                <button @click="deleteFileAssociation(association.extension)" class="delete-btn">
                  {{ t('fileAssociations.delete') }}
                </button>
              </div>
              <div v-else class="edit-actions">
                <button @click="saveEditedAssociation" class="save-btn">
                  {{ t('fileAssociations.save') }}
                </button>
                <button @click="cancelEdit" class="cancel-btn">
                  {{ t('fileAssociations.cancel') }}
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
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
  .form-row {
    flex-direction: column;
    align-items: stretch;
  }

  .form-row .form-group {
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
  .add-file-association-form h3,
  .file-associations-list h3 {
    font-size: 14px;
  }

  .no-associations {
    padding: 20px 10px;
    font-size: 13px;
  }
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
</style>