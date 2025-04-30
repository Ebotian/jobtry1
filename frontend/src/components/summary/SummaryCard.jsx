import React from 'react';
import './SummaryCard.css';

const SummaryCard = ({ summary }) => {
  // 示例摘要内容
  const displaySummary = summary || '暂无摘要，请先运行任务或等待AI分析结果...';

  return (
    <div className="summary-root">
      <h3 className="summary-title">AI分析摘要</h3>
      <div className="summary-content">{displaySummary}</div>
    </div>
  );
};

export default SummaryCard;
