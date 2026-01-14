export default {
  // 应用标题
  app: {
    title: 'ripgrep GUI'
  },
  
  // 搜索配置
  search: {
    selectDirectory: '选择搜索目录',
    searchPattern: '输入搜索模式... (至少2个字符)',
    searchHint: '至少需要输入{minLength}个字符',
    searchScope: {
      both: '搜索内容和文件名',
      content: '仅内容',
      filename: '仅文件名'
    },
    history: '历史',
    searching: '搜索中...',
    search: '搜索',
    directoryPickerTitle: '选择搜索目录',
    // 搜索选项
    options: {
      contentSearch: '内容搜索:',
      filenameSearch: '文件名搜索:',
      caseInsensitive: '忽略大小写',
      wholeWord: '全字匹配',
      regex: '正则表达式',
      ignoreHidden: '忽略隐藏文件',
      advanced: '高级',
      filenameExactMatch: '文件名精确匹配',
      caseSensitive: '大小写敏感'
    },
    // 高级选项对话框
    advancedOptions: {
      contentSearchTitle: '内容搜索高级选项',
      filenameSearchTitle: '文件名搜索高级选项',
      close: '关闭',
      cancel: '取消',
      confirm: '确定',
      // 搜索模式
      searchMode: '搜索模式',
      fixedStrings: '固定字符串模式（非正则）',
      invertMatch: '反转匹配（显示不匹配的行）',
      lineRegexp: '整行匹配',
      smartCase: '智能大小写（全小写模式时不敏感）',
      text: '搜索二进制文件作为文本',
      multiline: '多行搜索',
      multilineDotall: '多行搜索时 . 匹配换行符',
      pcre2: '使用 PCRE2 正则引擎',
      // 文件过滤
      fileFilter: '文件过滤',
      includePatterns: '包含的文件模式:',
      excludePatterns: '排除的文件模式:',
      fileTypes: '包含的文件类型:',
      fileTypesNot: '排除的文件类型:',
      noIgnore: '不使用 ignore 文件',
      noIgnoreVcs: '不忽略 VCS 文件',
      followSymlinks: '跟随符号链接',
      // 搜索行为
      searchBehavior: '搜索行为',
      minDepth: '最小搜索深度:',
      maxDepth: '最大搜索深度:',
      threads: '使用的线程数:',
      maxCount: '每个文件的最大匹配数:',
      unlimited: '(0 = 无限制)',
      auto: '(0 = 自动)',
      // 输出选项
      outputOptions: '输出选项',
      lineNumber: '显示行号',
      withFilename: '显示文件名',
      context: '显示匹配上下文行数:',
      afterContext: '显示匹配后上下文行数:',
      beforeContext: '显示匹配前上下文行数:',
      // 文件名搜索高级选项
      includeIgnoredFiles: '包含忽略文件',
      includeVcsIgnoredFiles: '包含VCS忽略文件',
      extensions: '文件扩展名:',
      fileSize: '文件大小:',
      changedWithin: '最近修改时间:',
      changedBefore: '之前修改时间:'
    }
  },
  
  // 设置
  settings: {
    title: '设置',
    general: '基本设置',
    fileAssociations: '文件关联',
    about: '关于',
    language: '语言',
    darkMode: '深色模式',
    save: '保存',
    cancel: '取消',
    success: '设置保存成功！'
  },
  
  // 搜索结果
  results: {
    noResults: '未找到结果',
    loading: '加载结果中...',
    filesFound: '找到{count}个文件',
    matchesFound: '找到{count}个匹配',
    file: '文件',
    line: '行',
    match: '匹配'
  },
  
  // 文件预览
  preview: {
    title: '文件预览',
    noFileSelected: '未选择文件',
    loading: '加载文件中...'
  },
  
  // 搜索历史
  history: {
    title: '搜索历史',
    clear: '清空历史',
    empty: '历史记录为空',
    confirmClear: '确定要清空所有搜索历史吗？'
  },
  
  // 错误信息
  error: {
    directoryPicker: '打开目录选择器失败，请检查应用权限',
    searchFailed: '搜索失败',
    invalidPath: '无效的搜索路径',
    extensionRequired: '扩展名不能为空',
    appPathRequired: '应用路径不能为空',
    invalidFileFormat: '无效的文件格式'
  },
  
  // 关于页面
  about: {
    appName: 'Ripgrep GUI',
    appDescription: '一个基于 Tauri 和 Vue 3 的跨平台文件搜索工具',
    version: '版本: ',
    hasUpdate: '有更新',
    projectInfo: '项目信息',
    author: '作者: papudding',
    repository: '仓库地址: ',
    technology: '技术栈',
    frontend: '前端: ',
    backend: '后端: ',
    searchEngine: '搜索引擎: ',
    license: '许可证',
    mitLicense: 'MIT License'
  },
  
  // 文件关联
    fileAssociations: {
      importConfig: '导入配置',
      exportConfig: '导出配置',
      addFileAssociation: '添加文件关联',
      add: '添加',
      extension: '扩展名',
      extensionPlaceholder: '例如：txt',
      defaultApp: '默认应用',
      selectApp: '选择应用程序',
      selectedFileAssociations: '已配置的文件关联',
      searchExtension: '搜索扩展名...',
      noAssociations: '暂无文件关联配置',
      actions: '操作',
      edit: '编辑',
      delete: '删除',
      save: '保存',
      cancel: '取消',
      select: '选择',
      exportSuccess: '文件关联配置导出成功',
      exportFailed: '导出失败: {error}',
      importSuccess: '文件关联配置导入成功',
      importFailed: '导入失败: {error}'
    },
    // 占位符
    placeholders: {
      example: '例如:',
      exampleFilePatterns: '例如: *.js,*.ts',
      exampleLogPatterns: '例如: *.log,*.tmp',
      exampleFileTypes: '例如: javascript,typescript',
      exampleExcludeTypes: '例如: json,xml',
      exampleExtensions: '例如: js,ts,json',
      exampleNodeModules: '例如: node_modules,*.log',
      exampleFileSize: '例如: +100k, -10M',
      exampleTimePeriod: '例如: 1d, 2weeks'
    }
};