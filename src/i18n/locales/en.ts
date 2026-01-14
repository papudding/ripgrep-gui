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
    directoryPickerTitle: 'Select Search Directory',
    // 搜索选项
    options: {
      contentSearch: 'Content Search:',
      filenameSearch: 'Filename Search:',
      caseInsensitive: 'Case Insensitive',
      wholeWord: 'Whole Word',
      regex: 'Regular Expression',
      ignoreHidden: 'Ignore Hidden Files',
      advanced: 'Advanced',
      filenameExactMatch: 'Exact Filename Match',
      caseSensitive: 'Case Sensitive'
    },
    // 高级选项对话框
    advancedOptions: {
      contentSearchTitle: 'Advanced Content Search Options',
      filenameSearchTitle: 'Advanced Filename Search Options',
      close: 'Close',
      cancel: 'Cancel',
      confirm: 'Confirm',
      // 搜索模式
      searchMode: 'Search Mode',
      fixedStrings: 'Fixed Strings (Non-regex)',
      invertMatch: 'Invert Match (Show non-matching lines)',
      lineRegexp: 'Whole Line Match',
      smartCase: 'Smart Case (Insensitive when all lowercase)',
      text: 'Search Binary Files as Text',
      multiline: 'Multiline Search',
      multilineDotall: 'Multiline Dotall (. matches newlines)',
      pcre2: 'Use PCRE2 Regex Engine',
      // 文件过滤
      fileFilter: 'File Filtering',
      includePatterns: 'Included File Patterns:',
      excludePatterns: 'Excluded File Patterns:',
      fileTypes: 'Included File Types:',
      fileTypesNot: 'Excluded File Types:',
      noIgnore: 'Do Not Use Ignore Files',
      noIgnoreVcs: 'Do Not Ignore VCS Files',
      followSymlinks: 'Follow Symbolic Links',
      // 搜索行为
      searchBehavior: 'Search Behavior',
      minDepth: 'Minimum Search Depth:',
      maxDepth: 'Maximum Search Depth:',
      threads: 'Threads Used:',
      maxCount: 'Max Matches per File:',
      unlimited: '(0 = Unlimited)',
      auto: '(0 = Auto)',
      // 输出选项
      outputOptions: 'Output Options',
      lineNumber: 'Show Line Numbers',
      withFilename: 'Show Filenames',
      context: 'Context Lines:',
      afterContext: 'After Context Lines:',
      beforeContext: 'Before Context Lines:',
      // 文件名搜索高级选项
      includeIgnoredFiles: 'Include Ignored Files',
      includeVcsIgnoredFiles: 'Include VCS Ignored Files',
      extensions: 'File Extensions:',
      fileSize: 'File Size:',
      changedWithin: 'Modified Within:',
      changedBefore: 'Modified Before:'
    }
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
    },
    // 占位符
    placeholders: {
      example: 'e.g.,',
      exampleFilePatterns: 'e.g., *.js,*.ts',
      exampleLogPatterns: 'e.g., *.log,*.tmp',
      exampleFileTypes: 'e.g., javascript,typescript',
      exampleExcludeTypes: 'e.g., json,xml',
      exampleExtensions: 'e.g., js,ts,json',
      exampleNodeModules: 'e.g., node_modules,*.log',
      exampleFileSize: 'e.g., +100k, -10M',
      exampleTimePeriod: 'e.g., 1d, 2weeks'
    }
};