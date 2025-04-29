import React from 'react';
import PropTypes from 'prop-types';

/**
 * ChatInput 组件 - 消息输入框和发送按钮
 *
 * @param {Object} props - 组件属性
 * @param {string} props.value - 输入框的值
 * @param {Function} props.onChange - 输入变化时的处理函数
 * @param {Function} props.onSend - 发送消息的处理函数
 * @param {boolean} [props.disabled=false] - 是否禁用输入
 * @returns {JSX.Element} 聊天输入组件
 */
const ChatInput = ({ value, onChange, onSend, disabled = false }) => {
  /**
   * 处理键盘事件，按下Enter键发送消息
   * @param {React.KeyboardEvent} e - 键盘事件对象
   */
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault(); // 防止换行
      if (value.trim() && !disabled) {
        onSend(value);
      }
    }
  };

  /**
   * 处理点击发送按钮事件
   */
  const handleSend = () => {
    if (value.trim() && !disabled) {
      onSend(value);
    }
  };

  return (
    <div className="chat-input">
      <textarea
        className="message-input"
        placeholder="在这里输入您的消息..."
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        rows={1}
        autoFocus
      />
      <button
        className="send-button"
        onClick={handleSend}
        disabled={disabled || !value.trim()}
        aria-label="发送消息"
      >
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <line x1="22" y1="2" x2="11" y2="13"></line>
          <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
        </svg>
      </button>
    </div>
  );
};

ChatInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onSend: PropTypes.func.isRequired,
  disabled: PropTypes.bool
};

export default ChatInput;