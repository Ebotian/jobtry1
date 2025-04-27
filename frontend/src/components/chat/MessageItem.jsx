import React from 'react';
import PropTypes from 'prop-types';

/**
 * MessageItem 组件 - 单条消息的展示
 *
 * @param {Object} props - 组件属性
 * @param {Object} props.message - 消息对象
 * @param {string} props.message.type - 消息类型（'user' 或 'ai'）
 * @param {string} props.message.content - 消息内容
 * @param {Date|string} [props.message.timestamp] - 消息时间戳
 * @returns {JSX.Element} 消息项组件
 */
const MessageItem = ({ message }) => {
  const { type, content, timestamp } = message;
  const isAi = type === 'ai';

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
          {content}
        </div>
        {timestamp && (
          <div className="message-time">
            {formatTime(timestamp)}
          </div>
        )}
      </div>
    </div>
  );
};

MessageItem.propTypes = {
  message: PropTypes.shape({
    type: PropTypes.oneOf(['user', 'ai']).isRequired,
    content: PropTypes.string.isRequired,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
  }).isRequired
};

export default MessageItem;