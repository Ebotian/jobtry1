import React from 'react';
import './MainLayout.css';
import Sidebar from '../sidebar/Sidebar';
import ControlPanel from '../controls/ControlPanel';
import ChatContainer from '../chat/ChatContainer';
import SummaryCard from '../summary/SummaryCard';
import ChartContainer from '../charts/ChartContainer';
import HistoryPanel from '../history/HistoryPanel';

const MainLayout = () => {
  return (
    <div className="main-layout">
      {/* 左侧侧边栏 */}
      <aside className="sidebar">
        <Sidebar />
      </aside>
      {/* 主内容区域 */}
      <main className="content">
        {/* 顶部：任务参数配置 */}
        <section className="control-panel" id="section-home">
          <ControlPanel />
        </section>
        {/* 中部：聊天界面和摘要 */}
        <section className="chat-summary" id="section-analysis">
          <div className="chat-container">
            <ChatContainer />
          </div>
          <div className="summary-card">
            <SummaryCard />
          </div>
        </section>
        {/* 底部：数据可视化和历史记录 */}
        <section className="charts-history">
          <div className="chart-container">
            <ChartContainer />
          </div>
          <div className="history-panel" id="section-history">
            <HistoryPanel />
          </div>
        </section>
        {/* 设置区域预留 */}
        <section style={{display:'none'}} id="section-settings"></section>
      </main>
    </div>
  );
};

export default MainLayout;