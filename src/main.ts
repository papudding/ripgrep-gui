import { createApp } from "vue";
import App from "./App.vue";
import { store } from "./store";

// 导入配置管理工具
import { initializeConfig } from "./utils/configManager";

// 创建Vue应用实例
const app = createApp(App);

// 注册Vuex store
app.use(store);

// 应用启动前加载配置
async function startApp() {
  try {
    // 初始化配置（自动检测、创建和加载）
    const config = await initializeConfig();
    
    // 将配置应用到Vuex store
    await store.dispatch('config/loadConfig', config);
    
    // 更新历史记录路径（如果配置中指定了）
    if (config.historyPath) {
      await store.dispatch('history/setHistoryPath', config.historyPath);
    }
    
    // 设置默认搜索路径（如果配置中指定了）
    if (config.defaultSearchPath) {
      await store.commit('search/setSearchPath', config.defaultSearchPath);
    }
    
    // 设置深色模式偏好
    store.state.isDarkMode = config.userConfig.darkMode;
    
    // 挂载应用
    app.mount("#app");
    
  } catch (error) {
    console.error("应用程序启动失败:", error);
    // 即使配置加载失败，也要尝试启动应用
    app.mount("#app");
  }
}

// 启动应用
startApp();

