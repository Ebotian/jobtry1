import React, { useState } from 'react';
import './Sidebar.css';
import { FaHome, FaHistory, FaChartBar } from 'react-icons/fa';

const scrollToSection = (id) => {
  const el = document.getElementById(id);
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const sectionMap = [
  { id: 'section-home', icon: <FaHome className="sidebar-icon" />, label: '首页' },
  { id: 'section-history', icon: <FaHistory className="sidebar-icon" />, label: '历史' },
  { id: 'section-analysis', icon: <FaChartBar className="sidebar-icon" />, label: '分析' },

];

const Sidebar = () => {
  const [active, setActive] = useState('section-home');

  const handleClick = (id) => {
    setActive(id);
    scrollToSection(id);
  };

  return (
    <nav className="sidebar-nav">
      <div className="sidebar-logo">AI助手</div>
      <ul className="sidebar-menu">
        {sectionMap.map((item) => (
          <li
            key={item.id}
            className={`sidebar-item${active === item.id ? ' active' : ''}`}
            onClick={() => handleClick(item.id)}
          >
            {item.icon}
            <span>{item.label}</span>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default Sidebar;
