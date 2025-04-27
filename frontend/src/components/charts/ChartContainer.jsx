import React, { useState, useEffect, useRef } from 'react';
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
const ChartContainer = ({
  wordCloudData = [],
  mermaidDefinition = ''
}) => {
  // 响应式布局状态 ('horizontal' 或 'vertical')
  const [layout, setLayout] = useState('horizontal');

  // 容器引用，用于获取容器宽度
  const containerRef = useRef(null);

  /**
   * 处理窗口大小变化，更新布局
   */
  const handleResize = () => {
    // 检查容器宽度，决定布局方向
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setLayout(containerWidth < 768 ? 'vertical' : 'horizontal');
    }
  };

  // 组件挂载和窗口大小变化时更新布局
  useEffect(() => {
    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={`chart-container ${layout === 'vertical' ? 'vertical-layout' : 'horizontal-layout'}`}
    >
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
};

export default ChartContainer;