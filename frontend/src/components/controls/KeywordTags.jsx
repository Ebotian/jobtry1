import React from 'react';
import PropTypes from 'prop-types';

/**
 * 关键词标签组件 - 管理关键词标签和添加新关键词
 *
 * @param {Object} props - 组件属性
 * @param {string[]} props.keywords - 关键词数组
 * @param {Function} props.onRemove - 删除关键词的回调函数
 * @param {boolean} props.showAddForm - 是否显示添加关键词表单
 * @param {Function} props.onShowAddForm - 显示添加表单的回调函数
 * @param {Function} props.onHideAddForm - 隐藏添加表单的回调函数
 * @param {string} props.newKeyword - 新关键词的输入值
 * @param {Function} props.onNewKeywordChange - 新关键词输入变化的回调函数
 * @param {Function} props.onAddKeyword - 添加新关键词的回调函数
 * @param {Function} props.onKeyPress - 键盘按下事件的回调函数
 * @returns {JSX.Element} 关键词标签组件
 */
const KeywordTags = ({
  keywords,
  onRemove,
  showAddForm,
  onShowAddForm,
  onHideAddForm,
  newKeyword,
  onNewKeywordChange,
  onAddKeyword,
  onKeyPress
}) => {
  return (
    <div className="keyword-tags">
      {/* 已有关键词标签 */}
      {keywords.map((keyword, index) => (
        <div key={`${keyword}-${index}`} className="tag">
          <span className="tag-text">{keyword}</span>
          <button
            type="button"
            className="remove-tag-btn"
            onClick={() => onRemove(keyword)}
            aria-label={`移除关键词 ${keyword}`}
          >
            <span aria-hidden="true">×</span>
          </button>
        </div>
      ))}

      {/* 添加关键词表单或按钮 */}
      {showAddForm ? (
        <div className="add-keyword-form">
          <input
            type="text"
            value={newKeyword}
            onChange={onNewKeywordChange}
            onKeyPress={onKeyPress}
            placeholder="输入关键词"
            autoFocus
            className="keyword-input"
          />
          <div className="keyword-form-actions">
            <button
              type="button"
              className="add-btn"
              onClick={onAddKeyword}
              disabled={!newKeyword.trim()}
            >
              添加
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={onHideAddForm}
            >
              取消
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="add-keyword-btn"
          onClick={onShowAddForm}
        >
          <span className="add-icon">+</span>
          <span>添加关键词</span>
        </button>
      )}
    </div>
  );
};

KeywordTags.propTypes = {
  keywords: PropTypes.arrayOf(PropTypes.string).isRequired,
  onRemove: PropTypes.func.isRequired,
  showAddForm: PropTypes.bool.isRequired,
  onShowAddForm: PropTypes.func.isRequired,
  onHideAddForm: PropTypes.func.isRequired,
  newKeyword: PropTypes.string.isRequired,
  onNewKeywordChange: PropTypes.func.isRequired,
  onAddKeyword: PropTypes.func.isRequired,
  onKeyPress: PropTypes.func.isRequired
};

export default KeywordTags;