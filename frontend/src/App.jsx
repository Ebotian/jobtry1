import { useState, useRef } from 'react'
import './App.css'

function App() {
  // 关键词状态管理
  const [keywords, setKeywords] = useState([])
  const [newKeyword, setNewKeyword] = useState('')
  const [showAddKeyword, setShowAddKeyword] = useState(false)

  // 消息状态管理 - 保留接口但移除仿真数据
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const messageEndRef = useRef(null)

  // 控制面板状态 - 保留创意性设置但移除实时更新
  const [creativity, setCreativity] = useState(50)

  // 数据分析状态 - 保留接口但移除仿真数据
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState(null)

  // 自动滚动到最新消息
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  // 添加新关键词
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()])
      setNewKeyword('')
      setShowAddKeyword(false)
    }
  }

  // 删除关键词
  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword))
  }

  // 发送消息 - 保留接口
  const sendMessage = () => {
    if (inputMessage.trim()) {
      // 这里保留发送消息的接口，但移除具体实现
      // 后端会提供真实数据
      setInputMessage('')
    }
  }

  return (
    <div className="app-container">
      <div className="app-layout">
        {/* 侧边栏 - 移除第三个按钮 */}
        <div className="sidebar">
          {/* 侧边栏内容 */}
          <div className="sidebar-logo">
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
              <circle cx="12" cy="12" r="10"></circle>
              <polygon points="10 8 16 12 10 16 10 8"></polygon>
            </svg>
          </div>

          <div className="sidebar-nav">
            <div className="nav-item active">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M3 12h18M3 6h18M3 18h18"></path>
              </svg>
            </div>
            <div className="nav-item">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
              </svg>
            </div>
          </div>

          <div className="sidebar-profile">
            <div className="profile-avatar">
              <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>

        {/* 主要内容区域 */}
        <div className="content">
          {/* 聊天界面 */}
          <div className="chat-container">
            <div className="chat-header">AI 助手</div>
            <div className="message-list">
              {messages.map(message => (
                <div key={message.id} className={`message ${message.type}-message`}>
                  <div className="message-content">
                    <p>{message.content}</p>
                  </div>
                </div>
              ))}
              {isAnalyzing && (
                <div className="message ai-message">
                  <div className="message-content typing">
                    <p>思考中...</p>
                  </div>
                </div>
              )}
              <div ref={messageEndRef} />
            </div>
            <div className="chat-input">
              <input
                type="text"
                placeholder="在这里输入您的消息..."
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                disabled={isAnalyzing}
              />
              <button onClick={sendMessage} disabled={isAnalyzing}>
                发送
              </button>
            </div>
          </div>

          {/* 摘要卡片 */}
          <div className="summary-card">
            <h3>数据摘要</h3>
            <p>{analysisResults ? analysisResults.summary : '等待分析...'}</p>
          </div>

          {/* 数据可视化 */}
          <div className="visualizations">
            <div className="chart left-chart">
              {/* 左侧图表占位符 */}
              <div className="chart-placeholder">
                {analysisResults ? '区块链应用增长趋势数据' : '左侧图表: 区块链应用增长趋势'}
              </div>
            </div>
            <div className="chart right-chart">
              {/* 右侧图表占位符 */}
              <div className="chart-placeholder">
                {analysisResults ? '投资分布情况数据' : '右侧图表: 投资分布情况'}
              </div>
            </div>
          </div>

          {/* 控制面板 - 移除实时更新功能 */}
          <div className="controls">
            <div className="control slider-control">
              <label>分析创意性</label>
              <input
                type="range"
                min="1"
                max="100"
                value={creativity}
                onChange={(e) => setCreativity(parseInt(e.target.value))}
              />
            </div>
            <div className="control tag-control">
              {keywords.map((keyword, index) => (
                <div key={index} className="tag">
                  {keyword}
                  <span
                    className="remove-icon"
                    onClick={() => handleRemoveKeyword(keyword)}
                  >
                    ×
                  </span>
                </div>
              ))}

              {showAddKeyword ? (
                <div className="add-keyword-form">
                  <input
                    type="text"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                    placeholder="新关键词"
                    autoFocus
                  />
                  <button onClick={handleAddKeyword}>添加</button>
                  <button onClick={() => setShowAddKeyword(false)}>取消</button>
                </div>
              ) : (
                <div
                  className="add-keyword"
                  onClick={() => setShowAddKeyword(true)}
                >
                  + 添加关键词
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
