export default {
  // 应用标题
  app: {
    title: 'ripgrep GUI'
  },
  
  // 搜索配置
  search: {
    selectDirectory: 'Select Search Directory',
    searchPattern: 'Enter search pattern... (at least 2 characters)',
    searchHint: 'At least {minLength} characters required',
    searchScope: {
      both: 'Search content and filenames',
      content: 'Content only',
      filename: 'Filenames only'
    },
    history: 'History',
    searching: 'Searching...',
    search: 'Search',
    directoryPickerTitle: 'Select Search Directory'
  },
  
  // 设置
  settings: {
    title: 'Settings',
    general: 'General Settings',
    fileAssociations: 'File Associations',
    about: 'About',
    language: 'Language',
    darkMode: 'Dark Mode',
    save: 'Save',
    cancel: 'Cancel',
    success: 'Settings saved successfully!'
  },
  
  // 搜索结果
  results: {
    noResults: 'No results found',
    loading: 'Loading results...',
    filesFound: '{count} files found',
    matchesFound: '{count} matches found',
    file: 'File',
    line: 'Line',
    match: 'Match'
  },
  
  // 文件预览
  preview: {
    title: 'File Preview',
    noFileSelected: 'No file selected',
    loading: 'Loading file...'
  },
  
  // 搜索历史
  history: {
    title: 'Search History',
    clear: 'Clear History',
    empty: 'History is empty',
    confirmClear: 'Are you sure you want to clear all search history?'
  },
  
  // 错误信息
  error: {
    directoryPicker: 'Failed to open directory picker, please check app permissions',
    searchFailed: 'Search failed',
    invalidPath: 'Invalid search path',
    extensionRequired: 'Extension cannot be empty',
    appPathRequired: 'Application path cannot be empty',
    invalidFileFormat: 'Invalid file format'
  },
  
  // 关于页面
  about: {
    appName: 'Ripgrep GUI',
    appDescription: 'A cross-platform file search tool based on Tauri and Vue 3',
    version: 'Version:',
    hasUpdate: 'Update available',
    projectInfo: 'Project Information',
    author: 'Author: papudding',
    repository: 'Repository:',
    technology: 'Technology Stack',
    frontend: 'Frontend: ',
    backend: 'Backend: ',
    searchEngine: 'Search Engine: ',
    license: 'License',
    mitLicense: 'MIT License'
  },
  
  // 文件关联
  fileAssociations: {
    importConfig: 'Import Config',
    exportConfig: 'Export Config',
    addFileAssociation: 'Add File Association',
    add: 'Add',
    extension: 'Extension',
    extensionPlaceholder: 'e.g., txt',
    defaultApp: 'Default Application',
    selectApp: 'Select Application',
    selectedFileAssociations: 'Configured File Associations',
    searchExtension: 'Search extension...',
    noAssociations: 'No file associations configured',
    actions: 'Actions',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    select: 'Select',
    exportSuccess: 'File associations exported successfully',
    exportFailed: 'Export failed: {error}',
    importSuccess: 'File associations imported successfully',
    importFailed: 'Import failed: {error}'
  }
};