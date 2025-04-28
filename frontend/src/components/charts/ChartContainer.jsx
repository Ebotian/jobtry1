import React from 'react';
import LeftChart from './LeftChart';
import RightChart from './RightChart';
import './Charts.css';

/**
 * 图表容器组件 - 包含左侧词云图和右侧 Mermaid 图表
 *
 * @param {Object} props - 组件属性
 * @param {Array} [props.wordCloudData=[]] - 词云图数据
 * @param {string} [props.mermaidDefinition=''] - Mermaid 图表定义
 * @returns {JSX.Element} 图表容器组件
 */
const ChartContainer = ({ wordCloudData = [], mermaidDefinition = '' }) => (
  <div className="chart-container">
    {/* 左侧词云图 */}
    <div className="chart-panel word-cloud-panel">
      <h3 className="chart-title">热点词频分析</h3>
      <LeftChart data={wordCloudData} />
    </div>
    {/* 右侧 Mermaid 图表 */}
    <div className="chart-panel mermaid-panel">
      <h3 className="chart-title">AI 分析图表</h3>
      <RightChart definition={mermaidDefinition} />
    </div>
  </div>
);

export default ChartContainer;