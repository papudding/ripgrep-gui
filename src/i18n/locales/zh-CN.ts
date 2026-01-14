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
    directoryPickerTitle: '选择搜索目录'
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
  }
};