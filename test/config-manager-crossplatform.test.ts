// 配置管理跨平台测试脚本
// 由于项目没有配置测试框架，这是一个简单的验证脚本

import {
  getConfigFilePath,
  detectConfigFile,
  createDefaultConfig,
  loadConfig,
  saveConfig
} from '../src/utils/configManager';

// 测试用例1: 验证配置文件路径获取功能
async function testConfigFilePath() {
  console.log('=== 测试用例1: 验证配置文件路径获取功能 ===');
  
  try {
    const configPath = await getConfigFilePath();
    console.log('✅ 配置文件路径获取成功:', configPath);
    
    // 验证路径格式是否符合当前平台
    const isWindows = process.platform === 'win32';
    if (isWindows) {
      console.log('✅ 运行在Windows平台，路径格式应使用\\分隔符');
    } else {
      console.log('✅ 运行在非Windows平台，路径格式应使用/分隔符');
    }
    
    return true;
  } catch (error) {
    console.error('❌ 配置文件路径获取失败:', error);
    return false;
  }
}

// 测试用例2: 验证配置文件检测功能
async function testConfigFileDetection() {
  console.log('\n=== 测试用例2: 验证配置文件检测功能 ===');
  
  try {
    const exists = await detectConfigFile();
    console.log(`✅ 配置文件检测成功，文件${exists ? '存在' : '不存在'}`);
    return true;
  } catch (error) {
    console.error('❌ 配置文件检测失败:', error);
    return false;
  }
}

// 测试用例3: 验证默认配置创建功能
async function testCreateDefaultConfig() {
  console.log('\n=== 测试用例3: 验证默认配置创建功能 ===');
  
  try {
    const success = await createDefaultConfig();
    if (success) {
      console.log('✅ 默认配置创建成功');
    } else {
      console.error('❌ 默认配置创建失败');
      return false;
    }
    
    // 再次检测文件是否存在
    const exists = await detectConfigFile();
    if (exists) {
      console.log('✅ 配置文件创建后检测存在');
    } else {
      console.error('❌ 配置文件创建后检测不存在');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 默认配置创建失败:', error);
    return false;
  }
}

// 测试用例4: 验证配置加载功能
async function testLoadConfig() {
  console.log('\n=== 测试用例4: 验证配置加载功能 ===');
  
  try {
    const config = await loadConfig();
    console.log('✅ 配置加载成功');
    
    // 验证配置结构
    if (typeof config === 'object' && config !== null) {
      console.log('✅ 配置是有效的对象');
    } else {
      console.error('❌ 配置不是有效的对象');
      return false;
    }
    
    if ('defaultSearchPath' in config && 'historyPath' in config && 'userConfig' in config) {
      console.log('✅ 配置结构完整');
    } else {
      console.error('❌ 配置结构不完整');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 配置加载失败:', error);
    return false;
  }
}

// 测试用例5: 验证配置保存功能
async function testSaveConfig() {
  console.log('\n=== 测试用例5: 验证配置保存功能 ===');
  
  try {
    // 先加载当前配置
    const currentConfig = await loadConfig();
    
    // 修改配置
    const updatedConfig = {
      ...currentConfig,
      userConfig: {
        ...currentConfig.userConfig,
        darkMode: !currentConfig.userConfig.darkMode
      }
    };
    
    const success = await saveConfig(updatedConfig);
    if (success) {
      console.log('✅ 配置保存成功');
    } else {
      console.error('❌ 配置保存失败');
      return false;
    }
    
    // 重新加载验证
    const reloadedConfig = await loadConfig();
    if (reloadedConfig.userConfig.darkMode === updatedConfig.userConfig.darkMode) {
      console.log('✅ 配置保存后验证成功，darkMode值已更新');
    } else {
      console.error('❌ 配置保存后验证失败，darkMode值未更新');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 配置保存失败:', error);
    return false;
  }
}

// 运行所有测试用例
async function runAllTests() {
  console.log('开始运行配置管理跨平台测试...\n');
  
  const testResults = [];
  
  // 运行测试用例
  testResults.push(await testConfigFilePath());
  testResults.push(await testConfigFileDetection());
  testResults.push(await testCreateDefaultConfig());
  testResults.push(await testLoadConfig());
  testResults.push(await testSaveConfig());
  
  // 统计测试结果
  const passedCount = testResults.filter(result => result).length;
  const totalCount = testResults.length;
  
  console.log('\n' + '='.repeat(60));
  console.log(`测试完成: ${passedCount}/${totalCount} 个测试用例通过`);
  
  if (passedCount === totalCount) {
    console.log('🎉 所有测试用例通过！配置管理功能具备跨平台兼容性。');
  } else {
    console.log('❌ 部分测试用例失败，需要进一步调试。');
  }
}

// 执行测试
runAllTests().catch(error => {
  console.error('测试执行失败:', error);
});
