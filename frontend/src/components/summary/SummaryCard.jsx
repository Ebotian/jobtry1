import React, { useState } from 'react';
import './SummaryCard.css';

/**
 * SummaryCard组件 - 显示AI生成的摘要，并提供一键复制功能
 *
 * @param {Object} props 组件属性
 * @param {string} props.summary AI生成的摘要文本
 * @param {boolean} props.loading 是否正在生成摘要
 * @returns {JSX.Element} 摘要卡片组件
 */
const SummaryCard = ({ summary, loading }) => {
  // 复制状态管理
  const [copied, setCopied] = useState(false);

  // 处理复制功能
  const handleCopy = () => {
    navigator.clipboard.writeText(summary)
      .then(() => {
        setCopied(true);
        // 3秒后重置复制状态
        setTimeout(() => setCopied(false), 3000);
      })
      .catch(err => {
        console.error('复制失败:', err);
      });
  };

  return (
    <div className="summary-card">
      <div className="summary-header">
        <h2>AI 摘要</h2>
        <button
          className={`copy-button ${copied ? 'copied' : ''}`}
          onClick={handleCopy}
          disabled={loading || !summary || summary === '等待分析...'}
        >
          {copied ? '已复制！' : '复制摘要'}
        </button>
      </div>

      <div className="summary-content">
        {loading ? (
          <div className="loading-indicator">
            <div className="spinner"></div>
            <p>正在生成摘要...</p>
          </div>
        ) : (
          <div className="summary-text">
            {summary && summary !== '等待分析...' ? summary : '暂无摘要内容，请先进行对话以生成摘要。'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SummaryCard;