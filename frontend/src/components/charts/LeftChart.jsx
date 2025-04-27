import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

/**
 * 词云图组件 - 可视化热点词汇频率
 *
 * @param {Object} props - 组件属性
 * @param {Array} props.data - 词云数据，格式为 [{text: '词语', weight: 权重值}]
 * @returns {JSX.Element} 词云图组件
 */
const LeftChart = ({ data = [] }) => {
  // 创建 canvas 引用
  const canvasRef = useRef(null);

  /**
   * 生成随机颜色
   * @param {number} min - 最小亮度 (0-255)
   * @param {number} max - 最大亮度 (0-255)
   * @returns {string} 十六进制颜色值
   */
  const getRandomColor = (min = 160, max = 240) => {
    // 生成不同色调但亮度在可控范围内的颜色
    const h = Math.floor(Math.random() * 360); // 色相 0-359
    const s = Math.floor(40 + Math.random() * 30); // 饱和度 40-70%
    const l = Math.floor(min + Math.random() * (max - min)); // 亮度在指定范围内

    return `hsl(${h}, ${s}%, ${l}%)`;
  };

  /**
   * 计算词云布局
   */
  const calculateWordCloud = () => {
    if (!canvasRef.current || !data || data.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    // 清除画布
    ctx.clearRect(0, 0, width, height);

    // 计算最大权重，用于缩放字体大小
    const maxWeight = Math.max(...data.map(item => item.weight));

    // 绘制矩形背景
    ctx.fillStyle = '#242438';
    ctx.fillRect(0, 0, width, height);

    // 简单的词云布局算法 (实际项目中可使用专业库如 d3-cloud)
    const positions = [];
    const padding = 5;

    // 绘制每个词
    data.forEach(item => {
      const { text, weight } = item;

      // 根据权重计算字体大小 (12px 到 32px)
      const fontSize = 12 + (weight / maxWeight) * 20;
      ctx.font = `${fontSize}px Arial, sans-serif`;
      ctx.fillStyle = getRandomColor();

      const metrics = ctx.measureText(text);
      const textWidth = metrics.width;
      const textHeight = fontSize;

      // 寻找合适的位置放置词语
      let placed = false;
      let attempts = 0;
      let posX, posY;

      while (!placed && attempts < 200) {
        attempts++;

        // 生成随机位置
        posX = padding + Math.random() * (width - textWidth - padding * 2);
        posY = padding + fontSize + Math.random() * (height - fontSize - padding * 2);

        // 检查是否与已放置的词语重叠
        let overlapping = false;
        for (const pos of positions) {
          if (
            posX < pos.x + pos.width + padding &&
            posX + textWidth + padding > pos.x &&
            posY < pos.y + padding &&
            posY + textHeight + padding > pos.y - textHeight
          ) {
            overlapping = true;
            break;
          }
        }

        if (!overlapping) {
          placed = true;
          positions.push({
            x: posX,
            y: posY,
            width: textWidth,
            height: textHeight
          });

          // 绘制文本
          ctx.fillText(text, posX, posY);
        }
      }

      // 如果尝试多次仍无法放置，则不显示该词
    });
  };

  // 当数据或组件尺寸改变时重新计算词云
  useEffect(() => {
    // 确保 canvas 已挂载且有数据
    if (canvasRef.current && data.length > 0) {
      // 设置 Canvas 尺寸
      const canvas = canvasRef.current;
      const container = canvas.parentElement;

      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        calculateWordCloud();
      }
    }
  }, [data]);

  // 监听窗口大小变化，重新调整词云
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const canvas = canvasRef.current;
        const container = canvas.parentElement;

        if (container) {
          canvas.width = container.clientWidth;
          canvas.height = container.clientHeight;
          calculateWordCloud();
        }
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [data]);

  // 如果没有数据，则显示空状态
  if (!data || data.length === 0) {
    return (
      <div className="empty-chart">
        <p>暂无词云数据</p>
      </div>
    );
  }

  return (
    <div className="word-cloud-container">
      <canvas ref={canvasRef} className="word-cloud-canvas"></canvas>
    </div>
  );
};

LeftChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      text: PropTypes.string.isRequired,
      weight: PropTypes.number.isRequired
    })
  )
};

export default LeftChart;