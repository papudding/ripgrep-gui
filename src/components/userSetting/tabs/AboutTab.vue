<script setup lang="ts">
// AboutTab 组件不需要 props 和 emit，只展示静态信息
import { getVersion } from '@tauri-apps/api/app';
import { ref, onMounted } from 'vue';

const appVersion = ref('1.0.0');
const latestVersion = ref('1.0.0');
const hasUpdate = ref(false);
const checkUpdateLoading = ref(true);
const checkUpdateError = ref(false);

// 比较版本号函数
function compareVersions(version1: string, version2: string): number {
  const v1 = version1.split('.').map(Number);
  const v2 = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const num1 = v1[i] || 0;
    const num2 = v2[i] || 0;
    
    if (num1 > num2) return 1;
    if (num1 < num2) return -1;
  }
  
  return 0;
}

// 获取GitHub仓库最新release版本
async function getLatestGithubVersion() {
  try {
    const response = await fetch('https://api.github.com/repos/papudding/ripgrep-gui/releases/latest');
    if (!response.ok) {
      throw new Error('获取最新版本失败');
    }
    const data = await response.json();
    return data.tag_name.replace(/^v/, ''); // 移除版本号前的 'v' 前缀
  } catch (error) {
    console.error('获取GitHub最新版本失败:', error);
    throw error;
  }
}

onMounted(async () => {
  try {
    // 获取当前应用版本
    appVersion.value = await getVersion();
    
    // 获取GitHub最新版本
    latestVersion.value = await getLatestGithubVersion();
    
    // 比较版本号
    hasUpdate.value = compareVersions(appVersion.value, latestVersion.value) < 0;
  } catch (error) {
    console.error('检查更新失败:', error);
    checkUpdateError.value = true;
  } finally {
    checkUpdateLoading.value = false;
  }
});
</script>

<template>
  <div class="about-tab">
    <div class="about-content">
      <div class="app-info">
        <h3>Ripgrep GUI</h3>
        <p class="app-description">一个基于 Tauri 和 Vue 3 的跨平台文件搜索工具</p>
        <div class="version-container">
          <p class="app-version">版本: {{ appVersion }}</p>
          <a v-if="hasUpdate" href="https://github.com/papudding/ripgrep-gui/releases/latest" target="_blank" rel="noopener noreferrer" class="update-badge">有更新</a>
        </div>
      </div>
      
      <div class="repository-info">
        <h4>项目信息</h4>
        <p>作者: papudding</p>
        <p>仓库地址: <a href="https://github.com/papudding/ripgrep-gui" target="_blank" rel="noopener noreferrer">https://github.com/papudding/ripgrep-gui</a></p>
      </div>
      
      <div class="technology-info">
        <h4>技术栈</h4>
        <ul class="tech-stack">
          <li>前端: <a href="https://vuejs.org/" target="_blank" rel="noopener noreferrer">Vue 3</a> + TypeScript + Vite</li>
          <li>后端: Rust + <a href="https://tauri.app/" target="_blank" rel="noopener noreferrer">Tauri 2.0</a></li>
          <li>搜索引擎: <a href="https://github.com/BurntSushi/ripgrep" target="_blank" rel="noopener noreferrer">ripgrep</a> + <a href="https://github.com/sharkdp/fd" target="_blank" rel="noopener noreferrer">fd</a> </li>
        </ul>
      </div>
      
      <div class="license-info">
        <h4>许可证</h4>
        <p>MIT License</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.version-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

.app-version {
  font-size: 14px;
  color: var(--accent-color);
  font-weight: 500;
  margin: 0;
}

.update-badge {
  padding: 2px 8px;
  background-color: #e74c3c;
  color: white;
  font-size: 12px;
  font-weight: 500;
  border-radius: 12px;
  animation: pulse 2s infinite;
  text-decoration: none;
  cursor: pointer;
  display: inline-block;
}

.update-badge:hover {
  background-color: #c0392b;
  transform: scale(1.05);
  transition: all 0.2s ease;
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0.7);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(231, 76, 60, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(231, 76, 60, 0);
  }
}

.repository-info,
.technology-info,
.license-info {
  background-color: var(--bg-secondary);
  padding: 16px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
}

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

.tech-stack a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color 0.2s ease;
}

.tech-stack a:hover {
  color: var(--accent-hover);
  text-decoration: underline;
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

/* 小屏幕设备 */
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
