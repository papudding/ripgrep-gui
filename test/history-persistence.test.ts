// 历史记录持久化测试脚本
// 由于项目没有配置测试框架，这是一个简单的验证脚本

import { writeTextFile, readTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { join } from '@tauri-apps/api/path';

// 模拟搜索历史数据结构
interface SearchOptions {
  caseInsensitive: boolean;
  wholeWord: boolean;
  regex: boolean;
  ignoreHidden: boolean;
  includeTypes: string[];
  excludeTypes: string[];
  maxDepth: number;
}

interface SearchHistory {
  id: string;
  pattern: string;
  path: string;
  options: SearchOptions;
  timestamp: number;
}

// 历史记录存储文件名
const HISTORY_FILE_NAME = 'search_history.json';

// 获取历史记录文件路径
async function getHistoryFilePath(): Promise<string> {
  // 使用当前工作目录作为测试路径
  const historyDir = join(process.cwd(), 'test-history');
  
  try {
    // 检查目录是否存在，不存在则创建
    const dirExists = await exists(historyDir);
    if (!dirExists) {
      // 创建目录，递归创建父目录
      await mkdir(historyDir, { recursive: true });
    }
  } catch (error) {
    console.error('创建历史记录目录失败:', error);
    // 目录创建失败时，使用当前目录作为备用
    return join(process.cwd(), HISTORY_FILE_NAME);
  }
  
  // 生成完整的历史记录文件路径
  return join(historyDir, HISTORY_FILE_NAME);
}

// 测试用例1: 验证历史记录保存功能
async function testSaveHistory() {
  console.log('=== 测试用例1: 验证历史记录保存功能 ===');
  
  try {
    // 创建测试数据
    const testHistory: SearchHistory[] = [
      {
        id: '1',
        pattern: 'test1',
        path: '/test/path1',
        options: {
          caseInsensitive: false,
          wholeWord: false,
          regex: false,
          ignoreHidden: true,
          includeTypes: [],
          excludeTypes: [],
          maxDepth: 0
        },
        timestamp: Date.now()
      },
      {
        id: '2',
        pattern: 'test2',
        path: '/test/path2',
        options: {
          caseInsensitive: true,
          wholeWord: true,
          regex: false,
          ignoreHidden: false,
          includeTypes: [],
          excludeTypes: [],
          maxDepth: 1
        },
        timestamp: Date.now() - 3600000
      }
    ];
    
    // 保存到文件
    const filePath = await getHistoryFilePath();
    await writeTextFile(filePath, JSON.stringify(testHistory, null, 2));
    
    console.log('✅ 历史记录保存成功');
    
    // 验证文件是否存在
    const fileExists = await exists(filePath);
    if (fileExists) {
      console.log('✅ 历史记录文件创建成功');
    } else {
      console.error('❌ 历史记录文件创建失败');
      return false;
    }
    
    // 验证文件内容
    const fileContent = await readTextFile(filePath);
    const savedHistory = JSON.parse(fileContent) as SearchHistory[];
    
    if (savedHistory.length === testHistory.length) {
      console.log('✅ 历史记录数量正确');
    } else {
      console.error('❌ 历史记录数量不正确');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 保存历史记录测试失败:', error);
    return false;
  }
}

// 测试用例2: 验证历史记录加载功能
async function testLoadHistory() {
  console.log('\n=== 测试用例2: 验证历史记录加载功能 ===');
  
  try {
    // 获取文件路径
    const filePath = await getHistoryFilePath();
    
    // 验证文件是否存在
    const fileExists = await exists(filePath);
    if (!fileExists) {
      console.error('❌ 历史记录文件不存在');
      return false;
    }
    
    // 加载历史记录
    const fileContent = await readTextFile(filePath);
    const loadedHistory = JSON.parse(fileContent) as SearchHistory[];
    
    console.log('✅ 历史记录加载成功，共', loadedHistory.length, '条记录');
    
    // 验证记录格式
    for (const history of loadedHistory) {
      if (!history.id || !history.pattern || !history.path || !history.options || !history.timestamp) {
        console.error('❌ 历史记录格式不正确:', history);
        return false;
      }
    }
    
    console.log('✅ 历史记录格式正确');
    return true;
  } catch (error) {
    console.error('❌ 加载历史记录测试失败:', error);
    return false;
  }
}

// 测试用例3: 验证历史记录清理功能
async function testCleanupHistory() {
  console.log('\n=== 测试用例3: 验证历史记录清理功能 ===');
  
  try {
    // 创建超过30天的历史记录
    const testHistory: SearchHistory[] = [];
    const now = Date.now();
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    
    // 添加10条最近的记录
    for (let i = 0; i < 10; i++) {
      testHistory.push({
        id: `recent-${i}`,
        pattern: `recent-test-${i}`,
        path: `/test/path-recent-${i}`,
        options: {
          caseInsensitive: false,
          wholeWord: false,
          regex: false,
          ignoreHidden: true,
          includeTypes: [],
          excludeTypes: [],
          maxDepth: 0
        },
        timestamp: now - i * 3600000 // 每小时一条
      });
    }
    
    // 添加5条超过30天的记录
    for (let i = 0; i < 5; i++) {
      testHistory.push({
        id: `old-${i}`,
        pattern: `old-test-${i}`,
        path: `/test/path-old-${i}`,
        options: {
          caseInsensitive: false,
          wholeWord: false,
          regex: false,
          ignoreHidden: true,
          includeTypes: [],
          excludeTypes: [],
          maxDepth: 0
        },
        timestamp: thirtyDaysAgo - i * 3600000 // 超过30天
      });
    }
    
    // 保存到文件
    const filePath = await getHistoryFilePath();
    await writeTextFile(filePath, JSON.stringify(testHistory, null, 2));
    
    console.log('✅ 已创建包含新旧记录的测试数据，共', testHistory.length, '条');
    
    // 执行清理逻辑
    const maxAge = 30 * 24 * 60 * 60 * 1000;
    const fileContent = await readTextFile(filePath);
    const loadedHistory = JSON.parse(fileContent) as SearchHistory[];
    
    const filteredByDate = loadedHistory.filter(history => {
      return now - history.timestamp < maxAge;
    });
    
    // 只保留最近100条记录
    const cleanedHistory = filteredByDate.slice(0, 100);
    
    // 保存清理后的历史记录
    await writeTextFile(filePath, JSON.stringify(cleanedHistory, null, 2));
    
    console.log('✅ 历史记录清理完成，清理后剩余', cleanedHistory.length, '条记录');
    
    // 验证清理结果
    if (cleanedHistory.length === 10) {
      console.log('✅ 清理结果正确，只保留了最近10条记录');
    } else {
      console.error('❌ 清理结果不正确，预期10条，实际', cleanedHistory.length, '条');
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('❌ 清理历史记录测试失败:', error);
    return false;
  }
}

// 测试用例4: 验证历史记录数据一致性
async function testDataConsistency() {
  console.log('\n=== 测试用例4: 验证历史记录数据一致性 ===');
  
  try {
    // 创建包含各种选项的测试数据
    const testHistory: SearchHistory[] = [
      {
        id: '1',
        pattern: 'regex test',
        path: '/test/regex',
        options: {
          caseInsensitive: false,
          wholeWord: false,
          regex: true,
          ignoreHidden: true,
          includeTypes: ['js', 'ts'],
          excludeTypes: ['node_modules'],
          maxDepth: 2
        },
        timestamp: Date.now()
      },
      {
        id: '2',
        pattern: 'case insensitive',
        path: '/test/case',
        options: {
          caseInsensitive: true,
          wholeWord: true,
          regex: false,
          ignoreHidden: false,
          includeTypes: [],
          excludeTypes: [],
          maxDepth: 0
        },
        timestamp: Date.now() - 86400000
      }
    ];
    
    // 保存到文件
    const filePath = await getHistoryFilePath();
    await writeTextFile(filePath, JSON.stringify(testHistory, null, 2));
    
    // 重新加载
    const fileContent = await readTextFile(filePath);
    const loadedHistory = JSON.parse(fileContent) as SearchHistory[];
    
    // 验证数据一致性
    for (let i = 0; i < testHistory.length; i++) {
      const original = testHistory[i];
      const loaded = loadedHistory[i];
      
      if (original.id !== loaded.id || 
          original.pattern !== loaded.pattern || 
          original.path !== loaded.path ||
          JSON.stringify(original.options) !== JSON.stringify(loaded.options)) {
        console.error('❌ 数据一致性验证失败');
        console.error('原始数据:', original);
        console.error('加载数据:', loaded);
        return false;
      }
    }
    
    console.log('✅ 数据一致性验证成功');
    return true;
  } catch (error) {
    console.error('❌ 数据一致性测试失败:', error);
    return false;
  }
}

// 运行所有测试用例
async function runAllTests() {
  console.log('开始运行历史记录持久化测试...\n');
  
  const testResults = [];
  
  // 运行测试用例
  testResults.push(await testSaveHistory());
  testResults.push(await testLoadHistory());
  testResults.push(await testCleanupHistory());
  testResults.push(await testDataConsistency());
  
  // 统计测试结果
  const passedCount = testResults.filter(result => result).length;
  const totalCount = testResults.length;
  
  console.log('\n' + '='.repeat(50));
  console.log(`测试完成: ${passedCount}/${totalCount} 个测试用例通过`);
  
  if (passedCount === totalCount) {
    console.log('🎉 所有测试用例通过！历史记录持久化功能正常工作。');
  } else {
    console.log('❌ 部分测试用例失败，需要进一步调试。');
  }
}

// 执行测试
runAllTests().catch(error => {
  console.error('测试执行失败:', error);
});
