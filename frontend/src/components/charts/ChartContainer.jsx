import React from 'react';
import './ChartContainer.css';

// 示例数据，可替换为实际数据
const sampleTrends = [
  { label: 'AI', value: 120 },
  { label: '科技', value: 90 },
  { label: '社会', value: 60 },
  { label: '教育', value: 40 },
  { label: '医疗', value: 30 },
];

const ChartContainer = () => {
  return (
    <div className="chart-root">
      <h3 className="chart-title">趋势词条统计</h3>
      <div className="bar-chart">
        {sampleTrends.map((item, idx) => (
          <div className="bar-row" key={item.label}>
            <span className="bar-label">{item.label}</span>
            <div className="bar-outer">
              <div
                className="bar-inner"
                style={{ width: `${item.value}px`, background: `hsl(${idx * 50}, 70%, 60%)` }}
              >
                <span className="bar-value">{item.value}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChartContainer;
