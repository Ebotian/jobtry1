import React from 'react';
import PropTypes from 'prop-types';
import MessageItem from './MessageItem';

/**
 * MessageList 组件 - 渲染消息列表
 *
 * @param {Object} props - 组件属性
 * @param {Array} props.messages - 消息数组
 * @param {boolean} [props.isLoading=false] - 是否处于加载状态
 * @returns {JSX.Element} 消息列表组件
 */
const MessageList = ({ messages, isLoading = false }) => {
  return (
    <div className="messages-container">
      {messages.length === 0 && !isLoading ? (
        <div className="empty-messages">
          <p>暂无消息，开始对话吧</p>
        </div>
      ) : (
        messages.map(message => (
          <MessageItem
            key={message.id}
            message={message}
          />
        ))
      )}

      {/* 加载状态指示器 */}
      {isLoading && (
        <div className="message ai-message">
          <div className="message-avatar">
            <div className="ai-avatar">
              <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="9" y1="21" x2="9" y2="9"></line>
              </svg>
            </div>
          </div>
          <div className="message-content">
            <div className="message-bubble typing">
              <p>思考中</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      type: PropTypes.oneOf(['user', 'ai']).isRequired,
      content: PropTypes.string.isRequired,
      timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)])
    })
  ).isRequired,
  isLoading: PropTypes.bool
};

export default MessageList;