# ripgrep-gui

[English README](README.en.md)

一个基于 Tauri + Vue 3 + TypeScript + Rust 开发的跨平台 ripgrep 图形界面应用程序，提供高效、直观的文件内容搜索体验。

## 1. 项目概述

ripgrep-gui 是一个图形界面搜索工具，基于命令行工具 ripgrep (rg) 构建。提供GUI界面，让用户能够轻松配置搜索选项、查看搜索结果并预览文件内容。

<img width="789" height="968" alt="Snipaste_2025-12-31_18-02-51" src="https://github.com/user-attachments/assets/a05e1636-dddf-484c-bcaf-cc54139e010b" />


### 主要功能

- 🚀 基于 ripgrep 的高速搜索
- 🎨 支持浅色/深色主题自动切换
- 📋 丰富的搜索选项配置
- 🔍 支持正则表达式、大小写敏感、全字匹配等
- 📝 搜索历史记录管理
- 📄 实时文件内容预览
- ⚙️ 可配置的搜索深度、隐藏文件处理
- 🔄 跨平台支持（macOS、Windows、Linux）

### 技术栈

| 技术        | 版本   | 用途                 |
|-------------|--------|----------------------|
| Vue.js      | 3.5+   | 前端框架             |
| TypeScript  | 5.6+   | 类型安全             |
| Tauri       | 2.0+   | 跨平台桌面应用框架   |
| Rust        | -      | 后端逻辑             |
| Vuex        | 4.0+   | 状态管理             |
| Vite        | 6.0+   | 构建工具             |

## 2. 安装与设置
### 2.1 前提条件
- **ripgrep**：确保系统已安装 ripgrep 工具（核心搜索引擎）
  **验证方法**：打开终端/命令行工具，运行以下命令检查是否已安装：
    ```bash
    rg --version
    ```
    如果显示版本号（如 `ripgrep 15.1.0`），则表示已安装；否则需要进行安装。
### 2.2 安装包安装
1. 在release下载安装包安装（目前仅支持MacOS Apple Silicon ）
2. 编译安装，参考3. 开发配置

## 3. 开发配置
### 前提条件

- **Rust**：确保已安装 Rust 开发环境
  - 安装地址：[Rust 官方安装页面](https://www.rust-lang.org/zh-CN/tools/install)
  - 版本要求：1.75+（Tauri 2.0 要求）

- **Node.js**：使用 Node.js 22 版本
  - 安装地址：[Node.js 官方下载页面](https://nodejs.org/zh-cn/)

- **yarn**：使用 yarn 作为包管理器
  - 安装地址：[yarn 官方安装页面](https://yarnpkg.com/getting-started/install)

- **ripgrep**：确保系统已安装 ripgrep 工具（核心搜索引擎）

### 安装步骤

1. **克隆项目**

   ```bash
   git clone https://github.com/yourusername/ripgrep-gui.git
   cd ripgrep-gui
   ```

2. **安装依赖**

   ```bash
   yarn install
   ```

3. **构建应用**

   ```bash
   # 开发模式（带热重载）
   yarn tauri dev
   
   # 生产构建
   yarn tauri build
   ```

## 3. 配置文件说明

### 默认配置文件位置

ripgrep-gui 的配置文件会自动创建和管理，默认存储在以下位置：

**Unix/Linux/macOS 系统：**
```
~/.config/ripgrep-gui/config.json
```

**Windows 系统：**
```
%APPDATA%\ripgrep-gui\config.json
```

### 配置文件内容格式

配置文件使用 JSON 格式，包含以下主要配置项：

```json
{
  "defaultSearchPath": "/Users/yourusername",
  "historyPath": "/Users/yourusername/.config/ripgrep-gui/history",
  "userConfig": {
    "darkMode": true,
    "language": "zh-CN"
  }
}
```

**配置项说明：**

- `defaultSearchPath`: 默认搜索路径，首次启动时设置为用户主目录
- `historyPath`: 搜索历史记录存储路径
- `userConfig`: 用户配置（暂未使用）
  - `darkMode`: 是否启用深色模式（默认根据系统主题自动判断）（暂未使用）
  - `language`: 应用程序语言（默认使用浏览器语言）（暂未使用）

### 配置文件管理

- 配置文件会在首次启动应用程序时自动创建
- 所有配置修改都会自动保存到配置文件中
- 您可以手动编辑配置文件来修改设置，但建议在应用程序内进行修改以确保配置的正确性

## 4. 开发计划（TODO List）

以下是项目的开发计划和待办事项：

1. ✅ bug:没搜索到报错弹窗重复
2. ✅ feat:高亮
3. 🔧 feat:整体样式 重构
4. ✅ refactor:拆分文件
5. 🔧 bug:HTML文件不预览 
6. ✅ feat:历史记录持久化
7. 🔧 feat:i18n（国际化支持）
8. 🔧 feat:图标更换
9. 🔧 feat:快速打开文件
10. 🔧 feat:Windows 系统适配
11. 🔧 feat:内部集成 ripgrep
12. 🔧 feat:用户配置修改

标记说明：
- ✅ 已完成
- 🔧 待完成

## 4. 致谢

- [ripgrep](https://github.com/BurntSushi/ripgrep) - 强大的命令行搜索工具
- [Tauri](https://tauri.app/) - 现代化的跨平台桌面应用框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架

