import React, { useRef, useState, useEffect } from 'react';
import './ChatContainer.css';

const INIT_MSG = [
  { role: 'ai', text: '您好！请在下方输入您的问题或需求。' }
];

const ChatContainer = () => {
  const [messages, setMessages] = useState(INIT_MSG);
  const [input, setInput] = useState('');
  const messagesBoxRef = useRef(null);

  // 只让消息框内部滚动到底部
  useEffect(() => {
    if (messagesBoxRef.current) {
      messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    setMessages(prev => [
      ...prev,
      { role: 'user', text: input }
    ]);
    // 模拟AI回复
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'ai', text: 'AI正在处理您的请求：' + input }
      ]);
    }, 600);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSend();
  };

  const handleClear = () => {
    setMessages([]);
  };

  return (
    <div className="chat-root">
      <div className="chat-header">
        <span>AI 聊天</span>
        <button className="chat-clear-btn" onClick={handleClear}>清空</button>
      </div>
      <div className="chat-messages sms-style" ref={messagesBoxRef}>
        {messages.length === 0 ? (
          <div className="chat-empty">暂无消息</div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}
            >
              <span>{msg.text}</span>
            </div>
          ))
        )}
      </div>
      <div className="chat-input-row">
        <input
          className="chat-input"
          type="text"
          placeholder="请输入您的问题..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button className="chat-send-btn" onClick={handleSend}>发送</button>
      </div>
    </div>
  );
};

export default ChatContainer;
