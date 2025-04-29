import React, { useState } from 'react';
import './Controls.css';
import SliderControl from './SliderControl';
import KeywordTags from './KeywordTags';
import { startCrawling } from '../../services/crawlerService';

/**
 * 控制面板组件 - 包含创意性滑块和关键词标签
 * 负责管理分析参数和关键词
 *
 * @returns {JSX.Element} 控制面板组件
 */
const ControlPanel = ({ creativity, setCreativity }) => {
  // 关键词状态 - 用于内容分析的关键词列表
  const [keywords, setKeywords] = useState([]);

  // 新增关键词相关状态
  const [showAddKeyword, setShowAddKeyword] = useState(false);
  const [newKeyword, setNewKeyword] = useState('');

  // 爬取状态
  const [loading, setLoading] = useState(false);

  /**
   * 添加新关键词
   */
  const handleAddKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      setKeywords([...keywords, newKeyword.trim()]);
      setNewKeyword('');
      setShowAddKeyword(false);
    }
  };

  /**
   * 删除关键词
   * @param {string} keyword - 要删除的关键词
   */
  const handleRemoveKeyword = (keyword) => {
    setKeywords(keywords.filter(k => k !== keyword));
  };

  /**
   * 处理输入框变化
   * @param {React.ChangeEvent<HTMLInputElement>} e - 输入事件
   */
  const handleInputChange = (e) => {
    setNewKeyword(e.target.value);
  };

  /**
   * 处理键盘事件，按下Enter添加关键词
   * @param {React.KeyboardEvent} e - 键盘事件
   */
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddKeyword();
    }
  };

  return (
    <div className="controls">
      {/* 创意性滑块控制 */}
      <div className="control slider-control">
        <SliderControl
          label="创意性"
          min={1}
          max={100}
          value={creativity}
          onChange={setCreativity}
        />
      </div>

      {/* 关键词标签控制 */}
      <div className="control tag-control">
        <KeywordTags
          keywords={keywords}
          onRemove={handleRemoveKeyword}
          showAddForm={showAddKeyword}
          onShowAddForm={() => setShowAddKeyword(true)}
          onHideAddForm={() => setShowAddKeyword(false)}
          newKeyword={newKeyword}
          onNewKeywordChange={handleInputChange}
          onAddKeyword={handleAddKeyword}
          onKeyPress={handleKeyPress}
        />
        {/* 爬取按钮 */}
        <button
          className="crawl-btn"
          style={{ marginTop: 12 }}
          disabled={keywords.length === 0 || loading}
          onClick={async () => {
            setLoading(true);
            try {
              const result = await startCrawling({ keywords, type: 'weibo' });
              alert('爬取成功，获取到 ' + (Array.isArray(result) ? result.length : 0) + ' 条数据');
            } catch (e) {
              alert('爬取失败: ' + (e?.response?.data?.error?.message || e.message));
            }
            setLoading(false);
          }}
        >
          {loading ? '正在爬取...' : '开始爬取'}
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;