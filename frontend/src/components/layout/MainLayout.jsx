import React, { useState } from 'react';
import Sidebar from './Sidebar';
import ChatContainer from '../chat/ChatContainer';
import ChartContainer from '../charts/ChartContainer';
import SummaryCard from '../summary/SummaryCard';
import ControlPanel from '../controls/ControlPanel';

// 导入状态管理钩子
import useChatStore from '../../store/chatStore';

/**
 * MainLayout组件 - 应用程序的主要布局容器
 *
 * 负责管理整体页面布局，包括侧边栏和主内容区域
 * 将应用程序分为左右两个主要部分，并在右侧内容区排列各功能组件
 *
 * @returns {JSX.Element} 应用程序的主布局组件
 */
const MainLayout = () => {
  // 从状态管理中获取所需数据 - 使用单独的选择器避免创建新对象
  const aiSummary = useChatStore(state => state.summary);
  const isGeneratingSummary = useChatStore(state => state.isGeneratingSummary);

  // 使用本地状态管理图表数据，避免测试数据在组件中硬编码
  const [chartData, setChartData] = useState({
    wordCloudData: [],
    mermaidDefinition: `
      graph TD
        A[数据源] -->|处理| B(分析)
        B --> C{结果}
        C -->|待生成| D[图表]
    `
  });

  return (
    <div className="app-layout">
      {/* 左侧侧边栏 */}
      <Sidebar />

      {/* 右侧内容区域 */}
      <div className="content">
        {/* 聊天界面 */}
        <ChatContainer />

        {/* 摘要卡片 - 使用新创建的SummaryCard组件 */}
        <SummaryCard
          summary={aiSummary || '等待分析...'}
          loading={isGeneratingSummary}
        />

        {/* 数据可视化区域 */}
        <div className="visualizations">
          <ChartContainer
            wordCloudData={chartData.wordCloudData}
            mermaidDefinition={chartData.mermaidDefinition}
          />
        </div>

        {/* 控制面板 */}
        <ControlPanel />
      </div>
    </div>
  );
};

export default MainLayout;