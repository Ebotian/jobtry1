import React, { useState } from 'react';
import './HistoryPanel.css';

// 示例历史数据
const sampleHistory = [
  {
    time: '2025-04-30 10:00',
    type: '新闻汇总',
    keyword: 'AI',
    summary: '今日AI相关新闻共采集12条，主要聚焦大模型、产业应用等。'
  },
  {
    time: '2025-04-30 09:00',
    type: '热点追踪',
    keyword: '科技',
    summary: '科技领域热度上升，讨论集中在芯片和智能硬件。'
  },
  {
    time: '2025-04-30 08:00',
    type: '社交分析',
    keyword: '社会',
    summary: '社交平台关于社会话题的讨论以教育和医疗为主。'
  }
];

const HistoryPanel = () => {
  const [history] = useState(sampleHistory);

  return (
    <div className="history-root">
      <h3 className="history-title">任务历史记录</h3>
      <div className="history-list">
        {history.map((item, idx) => (
          <div className="history-item" key={idx}>
            <div className="history-meta">
              <span className="history-time">{item.time}</span>
              <span className="history-type">{item.type}</span>
              <span className="history-keyword">关键词: {item.keyword}</span>
            </div>
            <div className="history-summary">{item.summary}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
