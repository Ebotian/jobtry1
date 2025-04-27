import React from 'react';
import PropTypes from 'prop-types';

/**
 * 滑动控制组件 - 通用的滑动条控制器
 *
 * @param {Object} props - 组件属性
 * @param {string} props.label - 滑动控制器的标签文本
 * @param {number} props.value - 当前值
 * @param {Function} props.onChange - 值变化时的回调函数
 * @param {number} [props.min=0] - 最小值
 * @param {number} [props.max=100] - 最大值
 * @returns {JSX.Element} 滑动控制组件
 */
const SliderControl = ({ label, value, onChange, min = 0, max = 100 }) => {
  /**
   * 处理滑动条变化
   * @param {React.ChangeEvent<HTMLInputElement>} e - 变化事件
   */
  const handleChange = (e) => {
    const newValue = parseInt(e.target.value, 10);
    onChange(newValue);
  };

  return (
    <div className="slider-wrapper">
      <div className="slider-header">
        <label htmlFor="slider-control">{label}</label>
        <span className="value-display">{value}</span>
      </div>
      <input
        type="range"
        id="slider-control"
        className="slider-input"
        min={min}
        max={max}
        value={value}
        onChange={handleChange}
        aria-valuenow={value}
        aria-valuemin={min}
        aria-valuemax={max}
      />
    </div>
  );
};

SliderControl.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  onChange: PropTypes.func.isRequired,
  min: PropTypes.number,
  max: PropTypes.number
};

export default SliderControl;