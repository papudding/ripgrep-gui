/**
 * 历史记录管理工具
 * 提供历史记录相关的配置和常量
 */

// 历史记录存储文件名
export const HISTORY_FILE_NAME = 'search_history.json';

// 历史记录配置
export const HISTORY_CONFIG = {
  // 最大历史记录数量
  MAX_HISTORY_COUNT: 100,
  // 历史记录保留天数
  MAX_HISTORY_DAYS: 30,
  // 自动清理间隔（毫秒）
  AUTO_CLEAN_INTERVAL: 24 * 60 * 60 * 1000 // 24小时
};
