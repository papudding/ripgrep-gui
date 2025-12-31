# ripgrep-gui

[中文 README](README.md)

A cross-platform ripgrep graphical interface application developed with Tauri + Vue 3 + TypeScript + Rust, providing an efficient and intuitive file content search experience.

## 1. Project Overview

ripgrep-gui is a graphical interface search tool built on the command-line tool ripgrep (rg). It provides a GUI interface that allows users to easily configure search options, view search results, and preview file contents.


### Main Features

- 🚀 High-speed search based on ripgrep
- 🎨 Support for automatic light/dark theme switching
- 📋 Rich search option configuration
- 🔍 Support for regular expressions, case sensitivity, whole word matching, etc.
- 📝 Search history management
- 📄 Real-time file content preview
- ⚙️ Configurable search depth and hidden file handling
- 🔄 Cross-platform support (macOS, Windows, Linux)

### Technology Stack

| Technology  | Version | Purpose                     |
|-------------|---------|-----------------------------|
| Vue.js      | 3.5+    | Frontend framework          |
| TypeScript  | 5.6+    | Type safety                 |
| Tauri       | 2.0+    | Cross-platform desktop app framework |
| Rust        | -       | Backend logic               |
| Vuex        | 4.0+    | State management            |
| Vite        | 6.0+    | Build tool                  |

## 2. Installation and Setup
### 2.1 Prerequisites
- **ripgrep**: Ensure the ripgrep tool is installed on your system (core search engine)
  **Verification Method**: Open a terminal/command line tool and run the following command to check if it's installed:
    ```bash
    rg --version
    ```
    If it displays a version number (e.g., `ripgrep 15.1.0`), it means it's already installed; otherwise, you need to install it.
### 2.2 Installer Installation
1. Download the installer from the release page (currently only supports macOS Apple Silicon)
2. Compile and install, refer to 3. Development Configuration

## 3. Development Configuration
### Prerequisites

- **Rust**: Ensure the Rust development environment is installed
  - Installation URL: [Rust Official Installation Page](https://www.rust-lang.org/tools/install)
  - Version requirement: 1.75+ (required by Tauri 2.0)

- **Node.js**: Use Node.js 22 version
  - Installation URL: [Node.js Official Download Page](https://nodejs.org/en/)

- **yarn**: Use yarn as the package manager
  - Installation URL: [yarn Official Installation Page](https://yarnpkg.com/getting-started/install)

- **ripgrep**: Ensure the ripgrep tool is installed on your system (core search engine)

### Installation Steps

1. **Clone the project**

   ```bash
   git clone https://github.com/yourusername/ripgrep-gui.git
   cd ripgrep-gui
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Build the application**

   ```bash
   # Development mode (with hot reload)
   yarn tauri dev
   
   # Production build
   yarn tauri build
   ```

## 4. Configuration File Instructions

### Default Configuration File Location

The ripgrep-gui configuration file is automatically created and managed, and is stored by default in the following locations:

**Unix/Linux/macOS systems:**
```
~/.config/ripgrep-gui/config.json
```

**Windows systems:**
```
%APPDATA%\ripgrep-gui\config.json
```

### Configuration File Content Format

The configuration file uses JSON format and contains the following main configuration items:

```json
{
  "defaultSearchPath": "/Users/yourusername",
  "historyPath": "/Users/yourusername/.config/ripgrep-gui/history",
  "userConfig": {
    "darkMode": true,
    "language": "en-US"
  }
}
```

**Configuration Item Description:**

- `defaultSearchPath`: Default search path, set to the user's home directory on first launch
- `historyPath`: Search history storage path
- `userConfig`: User configuration (not yet used)
  - `darkMode`: Whether to enable dark mode (default is automatically determined based on system theme) (not yet used)
  - `language`: Application language (default uses browser language) (not yet used)

### Configuration File Management

- The configuration file is automatically created when the application is first launched
- All configuration modifications are automatically saved to the configuration file
- You can manually edit the configuration file to modify settings, but it's recommended to make modifications within the application to ensure configuration correctness

## 5. Development Plan (TODO List)

The following is the project's development plan and to-do items:

1. ✅ bug: Duplicate error popups when no results found
2. ✅ feat: Highlighting
3. 🔧 feat: Overall style refactoring
4. ✅ refactor: Split files
5. 🔧 bug: HTML files not previewing
6. ✅ feat: History persistence
7. 🔧 feat: i18n (internationalization support)
8. 🔧 feat: Icon replacement
9. 🔧 feat: Quick file opening
10. 🔧 feat: Windows system adaptation
11. 🔧 feat: Internal ripgrep integration
12. 🔧 feat: User configuration modification

Marking instructions:
- ✅ Completed
- 🔧 To be completed

## 6. Acknowledgments

- [ripgrep](https://github.com/BurntSushi/ripgrep) - A powerful command-line search tool
- [Tauri](https://tauri.app/) - A modern cross-platform desktop application framework
- [Vue.js](https://vuejs.org/) - A progressive JavaScript framework