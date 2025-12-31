/**
 * 高亮匹配文本
 * @param content 原始内容
 * @param match 匹配的文本
 * @returns 带有高亮标记的HTML字符串
 */
export function highlightMatch(content: string, match: string): string {
  if (!match || !content) return content;
  
  // 转义正则表达式特殊字符
  const escapeRegExp = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // 将内容按行分割
  const lines = content.split('\n');
  
  // 创建匹配正则表达式
  const escapedMatch = escapeRegExp(match);
  const matchRegex = new RegExp(`(${escapedMatch})`, 'gi');
  
  // 处理每一行
  const highlightedLines = lines.map(line => {
    // 为每行创建新的正则表达式实例，避免lastIndex问题
    const lineMatchRegex = new RegExp(escapedMatch, 'i');
    
    // 检查该行是否包含匹配文本
    const hasMatch = lineMatchRegex.test(line);
    
    // 对行内匹配文本进行高亮
    const highlightedLine = line.replace(matchRegex, '<span class="match-highlight">$1</span>');
    
    // 如果该行包含匹配文本，则添加行级高亮
    if (hasMatch) {
      return `<span class="match-line">${highlightedLine}</span>`;
    }
    
    return highlightedLine;
  });
  
  // 重新组合成完整内容
  return highlightedLines.join('\n');
}
