import React, { useState } from 'react';
import PropTypes from 'prop-types';
import ReactMarkdown from 'react-markdown';

/**
 * MessageItem 组件 - 单条消息的展示
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.message - 消息对象
 * @param {string} props.message.type - 消息类型（'user' 或 'ai'）
 * @param {string} props.message.content - 消息内容
 * @param {Date|string} [props.message.timestamp] - 消息时间戳
 * @param {Object} [props.message.rawResponse] - AI 的原始响应数据
 * @returns {JSX.Element} 消息项组件
 */
const MessageItem = ({ message }) => {
  const { type, content, timestamp, rawResponse } = message;
  const isAi = type === 'ai';
  const [showJson, setShowJson] = useState(false);

  /**
   * 格式化时间戳为可读形式
   * @param {Date|string} time - 时间戳
   * @returns {string} 格式化后的时间
   */
  const formatTime = (time) => {
    if (!time) return '';

    const date = time instanceof Date ? time : new Date(time);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // 判断是否可以切换显示 JSON
  const canToggleJson = isAi && rawResponse;

  return (
    <div className={`message ${isAi ? 'ai-message' : 'user-message'}`}>
      <div className="message-avatar">
        {isAi ? (
          <div className="ai-avatar">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="3" y1="9" x2="21" y2="9"></line>
              <line x1="9" y1="21" x2="9" y2="9"></line>
            </svg>
          </div>
        ) : (
          <div className="user-avatar">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          </div>
        )}
      </div>
      <div className="message-content">
        <div className="message-bubble">
          {isAi && showJson && rawResponse ? (
            <pre className="json-content">{typeof rawResponse === 'string' ? rawResponse : JSON.stringify(rawResponse)}</pre>
          ) : (
            <ReactMarkdown>{content}</ReactMarkdown>
          )}
        </div>
        <div className="message-footer">
          {timestamp && (
            <span className="message-time">
              {formatTime(timestamp)}
            </span>
          )}

          {canToggleJson && (
            <button
              onClick={() => setShowJson(!showJson)}
              className="toggle-json-btn"
            >
              {showJson ? '显示回复内容' : '显示原始结果'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.string.isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.instanceOf(Date), PropTypes.string]),
    rawResponse: PropTypes.oneOfType([PropTypes.object, PropTypes.string])
  }).isRequired
};

export default MessageItem;