<script setup lang="ts">
import { ref } from "vue";
import GeneralTab from './tabs/GeneralTab.vue';
import FileAssociationsTab from './tabs/FileAssociationsTab.vue';
import AboutTab from './tabs/AboutTab.vue';


// 定义组件属性
defineProps<{
  visible: boolean;
}>();

// 定义事件
const emit = defineEmits<{
  (e: 'close'): void;
}>();

// 文件关联配置
const activeTab = ref('general'); // general, fileAssociations



</script>

<template>
  <div v-if="visible" class="settings-modal-overlay">
    <div class="settings-modal">
      <div class="modal-header">
        <h2>设置</h2>
        <button @click="emit('close')" class="close-btn">
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
        <!-- 通用设置标签页 -->
        <GeneralTab v-if="activeTab === 'general'" />
        <!-- 文件关联标签页 -->
        <FileAssociationsTab v-else-if="activeTab === 'fileAssociations'" />
        <!-- 关于标签页 -->
        <AboutTab v-else-if="activeTab === 'about'" />

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
}
</style>