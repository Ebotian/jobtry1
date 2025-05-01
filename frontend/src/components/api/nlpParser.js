// nlpParser.js
export function parseConfigCommand(input) {
  // 定时频率
  const freqMatch = input.match(/(定时频率|频率|interval)[^\d]*(\d+)\s*分钟/);
  if (freqMatch) {
    return { field: 'interval', value: parseInt(freqMatch[2], 10) };
  }
  // 站点
  const siteMatch = input.match(/(站点|site)[^\w]*(thepaper\.cn|jiemian\.com|bjnews\.com\.cn|guancha\.cn|news\.163\.com|news\.sina\.com\.cn|ifeng\.com)/);
  if (siteMatch) {
    return { field: 'site', value: siteMatch[2] };
  }
  // 关键词
  const keywordMatch = input.match(/(关键词|keyword)[^\w]*([^\s]+)/);
  if (keywordMatch) {
    return { field: 'keyword', value: keywordMatch[2] };
  }
  // 任务类型
  const typeMatch = input.match(/(任务类型|类型|taskType)[^\w]*(新闻汇总|hot|热点追踪|social|社交分析)/);
  if (typeMatch) {
    return { field: 'taskType', value: typeMatch[2] };
  }
  // 没有匹配
  return null;
}