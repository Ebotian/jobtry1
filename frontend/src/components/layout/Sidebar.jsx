import React from 'react';
import './Sidebar.css';

/**
 * Sidebar组件 - 应用程序的侧边导航栏
 *
 * 提供应用程序的主要导航功能，包括logo、导航项和用户配置文件
 * 使用SVG图标实现简洁、现代的设计
 *
 * @param {Object} props - 组件的属性
 * @param {Function} props.onLoginClick - 用户头像点击事件处理函数
 * @returns {JSX.Element} 侧边栏导航组件
 */
const Sidebar = ({ onLoginClick }) => {
  return (
    <div className="sidebar">
      {/* Logo区域 */}
      <div className="sidebar-logo">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx="12" cy="12" r="10"></circle>
          <polygon points="10 8 16 12 10 16 10 8"></polygon>
        </svg>
      </div>

      {/* 导航菜单 */}
      <div className="sidebar-nav">
        {/* 仪表盘导航项 - 激活状态 */}
        <div className="nav-item active">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M3 12h18M3 6h18M3 18h18"></path>
          </svg>
        </div>

        {/* 聊天导航项 */}
        <div className="nav-item">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
        </div>
      </div>

      {/* 用户头像 */}
      <div className="sidebar-profile">
        <button type="button" className="profile-avatar" onClick={onLoginClick}>
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2" fill="none">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;