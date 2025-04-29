import api from './api';

// 启动爬虫任务
export async function startCrawling({ keywords, type = 'weibo', extra = {} }) {
  // type: 'weibo' 或 'news'，可根据需要扩展
  const res = await api.post('/crawler', {
    keywords,
    type,
    ...extra
  });
  return res.data;
}