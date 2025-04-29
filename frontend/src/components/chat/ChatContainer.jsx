import React, { useState, useRef, useEffect } from 'react';
import ChatHeader from './ChatHeader';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import useChatStore from '../../store/chatStore';
import '../chat/Chat.css';

/**
 * ChatContainer 组件 - 聊天界面的容器组件
 * 管理消息列表、消息输入和发送功能
 *
 * @returns {JSX.Element} 聊天容器组件
 */
const ChatContainer = () => {
  // 使用全局状态管理
  const { messages, isLoading, sendMessage } = useChatStore();

  // 本地状态管理
  const [inputMessage, setInputMessage] = useState('');

  // 引用消息列表底部元素，用于自动滚动
  const messageEndRef = useRef(null);

  /**
   * 处理消息发送
   * @param {string} content - 消息内容
   */
  const handleSendMessage = (content) => {
    if (content.trim()) {
      // 调用全局状态中的发送方法
      sendMessage(content);
      // 清空输入框
      setInputMessage('');
    }
  };

  /**
   * 处理输入变化
   * @param {React.ChangeEvent<HTMLInputElement>} e - 输入事件
   */
  const handleInputChange = (e) => {
    setInputMessage(e.target.value);
  };

  /**
   * 滚动到消息列表底部
   */
  const scrollToBottom = () => {
    if (messageEndRef.current) {
      const messageListContainer = messageEndRef.current.parentElement;
      if (messageListContainer) {
        messageListContainer.scrollTop = messageListContainer.scrollHeight;
      }
    }
  };

  // 当消息列表更新时，滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-container">
      <ChatHeader />
      <div className="message-list">
        <MessageList
          messages={messages}
          isLoading={isLoading}
        />
        <div ref={messageEndRef} />
      </div>
      <ChatInput
        value={inputMessage}
        onChange={handleInputChange}
        onSend={handleSendMessage}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatContainer;