import { writeTextFile, readTextFile, exists } from '@tauri-apps/plugin-fs';
import { join, appConfigDir } from '@tauri-apps/api/path';
import type { Config } from '../types';

// 配置文件名
const CONFIG_FILE_NAME = 'app_config.json';

/**
 * 获取配置文件的完整路径
 */
export async function getConfigFilePath(): Promise<string> {
  try {
    // 使用平台特定的应用配置目录
    const basePath = await appConfigDir();
    // 生成完整的配置文件路径
    return await join(basePath, CONFIG_FILE_NAME);
  } catch (error) {
    console.error('获取配置文件路径失败:', error);
    // 失败时使用当前目录作为备用
    return CONFIG_FILE_NAME;
  }
}

/**
 * 保存配置到文件
 * @param config 要保存的配置对象
 */
export async function saveConfig(config: Config): Promise<void> {
  try {
    const configData = JSON.stringify(config, null, 2);
    const filePath = await getConfigFilePath();
    await writeTextFile(filePath, configData);
    console.log('配置保存成功:', filePath);
  } catch (error) {
    console.error('保存配置失败:', error);
    throw new Error(`保存配置失败: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * 从文件加载配置
 * @param defaultConfig 默认配置对象，当配置文件不存在时使用
 */
export async function loadConfig(defaultConfig: Config): Promise<Config> {
  try {
    const filePath = await getConfigFilePath();
    const fileExists = await exists(filePath);
    
    if (fileExists) {
      const configData = await readTextFile(filePath);
      const parsedConfig = JSON.parse(configData);
      // 合并默认配置和读取的配置，确保所有必要字段都存在
      return { ...defaultConfig, ...parsedConfig };
    } else {
      // 配置文件不存在，使用默认配置
      console.warn('配置文件不存在，使用默认配置');
      return defaultConfig;
    }
  } catch (error) {
    console.error('加载配置失败:', error);
    // 加载失败时使用默认配置
    return defaultConfig;
  }
}

/**
 * 验证配置的有效性
 * @param config 要验证的配置对象
 */
export function validateConfig(config: Config): boolean {
  // 验证基本结构
  if (!config || typeof config !== 'object') {
    return false;
  }
  
  // 验证默认搜索路径（可选）
  if (config.defaultSearchPath && typeof config.defaultSearchPath !== 'string') {
    return false;
  }
  
  // 验证历史记录路径（可选）
  if (config.historyPath !== null && typeof config.historyPath !== 'string') {
    return false;
  }
  
  // 验证用户配置
  if (!config.userConfig || typeof config.userConfig !== 'object') {
    return false;
  }
  
  // 验证深色模式设置
  if (typeof config.userConfig.darkMode !== 'boolean') {
    return false;
  }
  
  // 验证语言设置
  if (typeof config.userConfig.language !== 'string') {
    return false;
  }
  
  return true;
}

/**
 * 合并配置
 * @param defaultConfig 默认配置
 * @param newConfig 新配置
 */
export function mergeConfig(defaultConfig: Config, newConfig: Partial<Config>): Config {
  return {
    ...defaultConfig,
    ...newConfig,
    userConfig: {
      ...defaultConfig.userConfig,
      ...(newConfig.userConfig || {})
    }
  };
}