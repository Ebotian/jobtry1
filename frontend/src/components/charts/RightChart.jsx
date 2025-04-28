import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import svgPanZoom from 'svg-pan-zoom';

/**
 * RightChart 组件 - 渲染 AI 生成的 Mermaid 图表
 *
 * @param {Object} props - 组件属性
 * @param {string} props.definition - Mermaid 图表定义
 * @returns {JSX.Element} Mermaid 图表组件
 */
const RightChart = ({ definition = '' }) => {
  // 保存处理后的 SVG 内容
  const [svgContent, setSvgContent] = useState('');

  // 加载状态
  const [loading, setLoading] = useState(false);

  // 错误状态
  const [error, setError] = useState(null);

  // 显示源代码状态
  const [showSource, setShowSource] = useState(false);

  // 复制状态反馈
  const [copyFeedback, setCopyFeedback] = useState('');

  // 实际使用的 Mermaid 定义
  const [actualDefinition, setActualDefinition] = useState('');

  // 图表容器引用
  const chartRef = useRef(null);
  // svg-pan-zoom 实例引用
  const panZoomRef = useRef(null);

  /**
   * 复制 Mermaid 源代码到剪贴板
   */
  const copySourceToClipboard = () => {
    try {
      navigator.clipboard.writeText(actualDefinition);
      setCopyFeedback('已复制!');

      // 3秒后清除反馈
      setTimeout(() => {
        setCopyFeedback('');
      }, 3000);
    } catch (err) {
      console.error('复制失败:', err);
      setCopyFeedback('复制失败');

      setTimeout(() => {
        setCopyFeedback('');
      }, 3000);
    }
  };

  /**
   * 切换源代码显示状态
   */
  const toggleSourceView = () => {
    setShowSource(!showSource);
  };

  /**
   * 重置缩放平移状态
   */
  const resetZoom = () => {
    if (panZoomRef.current) {
      panZoomRef.current.reset();
    }
  };

  /**
   * 渲染 Mermaid 图表
   * 使用动态导入 mermaid 库以减少初始加载时间
   */
  const renderMermaid = async () => {
    if (!definition) return;

    try {
      setLoading(true);
      setError(null);

      // 处理定义：如果是空字符串，使用默认图表；否则使用提供的定义
      const defToUse = definition.trim() || defaultChart;
      setActualDefinition(defToUse);

      // 动态导入 mermaid 库
      const mermaid = (await import('mermaid')).default;

      // 配置 mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'dark',
        themeCSS: '.node rect { fill: #2D2D4A; } .edgeLabel { color: #ffffff; }',
        fontFamily: 'Arial, sans-serif',
        securityLevel: 'loose',
        logLevel: 'error',
        flowchart: {
          curve: 'basis',
          htmlLabels: true
        }
      });

      // 生成唯一 ID
      const id = `mermaid-${Date.now()}`;

      // 使用 mermaid API 渲染图表到 SVG
      const { svg } = await mermaid.render(id, defToUse);

      // 更新 SVG 内容
      setSvgContent(svg);
      setLoading(false);

      // 使用 setTimeout 确保 SVG 已被渲染到 DOM
      setTimeout(() => {
        const svgElement = chartRef.current?.querySelector('svg');
        if (svgElement) {
          // 初始化 svg-pan-zoom
          if (panZoomRef.current) {
            panZoomRef.current.destroy();
          }

          panZoomRef.current = svgPanZoom(svgElement, {
            zoomEnabled: true,
            controlIconsEnabled: true,
            fit: true,
            center: true,
            minZoom: 0.5,
            maxZoom: 10,
            zoomScaleSensitivity: 0.3
          });

          // 初始缩放以适应内容
          panZoomRef.current.resize();
          panZoomRef.current.fit();
          panZoomRef.current.center();

          // 稍微放大以提高初始可见性
          setTimeout(() => panZoomRef.current.zoom(1.2), 100);
        }
      }, 100);

    } catch (err) {
      console.error('Mermaid 渲染错误:', err);
      setError('图表渲染失败，请检查图表定义格式');
      setLoading(false);
    }
  };

  // 当定义变化时重新渲染图表
  useEffect(() => {
    renderMermaid();

    // 清除函数，在组件卸载时销毁 svg-pan-zoom 实例
    return () => {
      if (panZoomRef.current) {
        panZoomRef.current.destroy();
        panZoomRef.current = null;
      }
    };
  }, [definition]);

  // 默认的示例图表，当没有提供定义时显示
  const defaultChart = `
    graph TD
      A[数据源] -->|抓取| B(数据处理)
      B --> C{分析结果}
      C -->|正面| D[上升趋势]
      C -->|负面| E[下降趋势]
      C -->|中性| F[持平]
  `;

  // 提供空状态图表
  const emptyChart = `
    graph TD
      A[暂无数据] -->|上传数据| B(开始分析)
      B -->|AI处理| C{查看结果}
  `;

  // 当处于加载状态时显示加载指示器
  if (loading) {
    return (
      <div className="loading-chart">
        <div className="loading-spinner"></div>
        <p>图表渲染中...</p>
      </div>
    );
  }

  // 当出现错误时显示错误信息
  if (error) {
    return (
      <div className="error-chart">
        <p className="error-message">{error}</p>
        <button
          className="retry-button"
          onClick={renderMermaid}
        >
          重试
        </button>
      </div>
    );
  }

  return (
    <div className="mermaid-chart-container" ref={chartRef}>
      {/* 图表操作栏 */}
      <div className="mermaid-actions">
        <button
          className="source-button"
          onClick={toggleSourceView}
          aria-label={showSource ? "隐藏源代码" : "显示源代码"}
          title={showSource ? "隐藏源代码" : "显示源代码"}
        >
          {showSource ? "隐藏源代码" : "显示源代码"}
        </button>
        <button
          className="copy-button"
          onClick={copySourceToClipboard}
          aria-label="复制源代码"
          title="复制源代码"
        >
          {copyFeedback || "复制源代码"}
        </button>
        <button
          className="reset-zoom-button"
          onClick={resetZoom}
          aria-label="重置缩放"
          title="重置缩放"
        >
          重置视图
        </button>
      </div>

      {/* 源代码显示区域 */}
      {showSource && (
        <div className="source-code-container">
          <pre className="source-code">
            {actualDefinition}
          </pre>
        </div>
      )}

      {/* 图表显示区域 */}
      {svgContent ? (
        <div
          className="mermaid-svg-container"
          dangerouslySetInnerHTML={{ __html: svgContent }}
        />
      ) : (
        <div className="empty-chart">
          <p>暂无图表数据</p>
        </div>
      )}
    </div>
  );
};

RightChart.propTypes = {
  definition: PropTypes.string
};

export default RightChart;