/**
 * 配置管理工具
 * 实现配置文件的自动检测、创建和加载功能
 */

// 导入类型定义
import type { Config } from '../types';

// 导入Tauri fs相关API
import { writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { join, homeDir } from '@tauri-apps/api/path';

// 配置文件存储目录名
const CONFIG_DIR_NAME = '.config';
const APP_CONFIG_DIR_NAME = 'ripgrep-gui';

// 配置文件名
const CONFIG_FILE_NAME = 'config.json';

/**
 * 获取配置文件路径
 * @returns 配置文件的完整路径
 */
export async function getConfigFilePath(): Promise<string> {
  try {
    // 获取用户目录
    const userHomeDir = await homeDir();
    
    // 构建配置文件夹路径
    const configDir = await join(userHomeDir, CONFIG_DIR_NAME, APP_CONFIG_DIR_NAME);
    
    // 构建配置文件路径
    const configPath = await join(configDir, CONFIG_FILE_NAME);
    return configPath;
  } catch (error) {
    console.error('获取配置文件路径失败:', error);
    // 失败时返回当前目录下的配置文件路径
    return CONFIG_FILE_NAME;
  }
}

/**
 * 检测配置文件是否存在
 * @returns 配置文件是否存在
 */
export async function detectConfigFile(): Promise<boolean> {
  try {
    // 获取配置文件路径
    const configPath = await getConfigFilePath();
    return await exists(configPath);
  } catch (error) {
    console.error('检测配置文件失败:', error);
    // 检测失败时返回false，后续会创建默认配置文件
    return false;
  }
}

/**
 * 创建默认配置文件
 * @returns 创建是否成功
 */
export async function createDefaultConfig(): Promise<boolean> {
  try {
    // 创建默认配置对象
    const defaultConfig: Config = {
      defaultSearchPath: await homeDir(),
      historyPath: await join(await homeDir(), CONFIG_DIR_NAME, APP_CONFIG_DIR_NAME, 'history'),
      userConfig: {
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        language: navigator.language
      }
    };
    
    // 转换为JSON格式
    const jsonContent = JSON.stringify(defaultConfig, null, 2);
    
    // 获取配置文件路径
    const configPath = await getConfigFilePath();
    
    // 提取配置文件夹路径
    const configDir = configPath.substring(0, configPath.lastIndexOf('/'));
    
    // 检查并创建配置文件夹（如果不存在）
    const dirExists = await exists(configDir);
    if (!dirExists) {
      console.warn('配置文件夹不存在，正在创建...');
      await mkdir(configDir, { recursive: true });
      console.warn('配置文件夹已创建:', configDir);
    }
    
    // 写入配置文件
    await writeTextFile(configPath, jsonContent);
    
    console.log(`默认配置文件已创建: ${configPath}`);
    return true;
  } catch (error) {
    console.error('创建默认配置文件失败:', error);
    return false;
  }
}

/**
 * 加载配置文件
 * @returns 加载的配置对象
 */
export async function loadConfig(): Promise<Config> {
  try {
    // 获取配置文件路径
    const configPath = await getConfigFilePath();
    
    // 读取配置文件内容
    const fileContent = await readTextFile(configPath);
    
    // 解析JSON内容
    const parsedConfig = JSON.parse(fileContent);
    
    // 验证配置对象结构，确保所有必要字段都存在
    const config: Config = {
      defaultSearchPath: parsedConfig.defaultSearchPath || '',
      historyPath: parsedConfig.historyPath || null,
      userConfig: {
        darkMode: parsedConfig.userConfig?.darkMode ?? window.matchMedia('(prefers-color-scheme: dark)').matches,
        language: parsedConfig.userConfig?.language ?? navigator.language
      }
    };
    
    return config;
  } catch (error) {
    console.error('加载配置文件失败:', error);
    // 加载失败时返回默认配置
    return {
      defaultSearchPath: '',
      historyPath: null,
      userConfig: {
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        language: navigator.language
      }
    };
  }
}

/**
 * 保存配置到文件
 * @param config 要保存的配置对象
 * @returns 保存是否成功
 */
export async function saveConfig(config: Config): Promise<boolean> {
  try {
    // 转换为JSON格式
    const jsonContent = JSON.stringify(config, null, 2);
    
    // 获取配置文件路径
    const configPath = await getConfigFilePath();
    
    // 提取配置文件夹路径
    const configDir = configPath.substring(0, configPath.lastIndexOf('/'));
    
    // 检查并创建配置文件夹（如果不存在）
    const dirExists = await exists(configDir);
    if (!dirExists) {
      console.warn('配置文件夹不存在，正在创建...');
      await mkdir(configDir, { recursive: true });
      console.warn('配置文件夹已创建:', configDir);
    }
    
    // 写入配置文件
    await writeTextFile(configPath, jsonContent);
    
    console.log('配置文件保存成功:', configPath);
    return true;
  } catch (error) {
    console.error('保存配置文件失败:', error);
    return false;
  }
}

/**
 * 初始化配置
 * 自动检测配置文件，不存在则创建，然后加载配置
 * @returns 初始化后的配置对象
 */
export async function initializeConfig(): Promise<Config> {
  try {
    // 检测配置文件是否存在
    const configExists = await detectConfigFile();
    
    // 如果配置文件不存在，创建默认配置文件
    if (!configExists) {
      await createDefaultConfig();
    }
    
    // 加载配置文件
    return await loadConfig();
  } catch (error) {
    console.error('初始化配置失败:', error);
    // 初始化失败时返回默认配置
    return {
      defaultSearchPath: '',
      historyPath: null,
      userConfig: {
        darkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
        language: navigator.language
      }
    };
  }
}
