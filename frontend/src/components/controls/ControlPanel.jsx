import React from "react";
import "./ControlPanel.css";
import * as taskService from "../api/taskService";

const ControlPanel = ({ config, onConfigChange }) => {
	// 自动提交参数到后端
	const handleChange = async (e) => {
		const { name, value } = e.target;
		const newConfig = {
			...config,
			[name]: name === "interval" ? Number(value) : value,
		};
		if (onConfigChange) onConfigChange(newConfig);
		try {
			await taskService.createOrUpdateTask(newConfig);
		} catch (err) {
			console.error("任务参数提交失败", err);
		}
	};

	return (
		<div className="control-panel-root">
			<div className="control-group">
				<label htmlFor="keyword">关键词</label>
				<input
					id="keyword"
					name="keyword"
					type="text"
					placeholder="->在这里输入<-"
					value={config.keyword}
					onChange={handleChange}
				/>
			</div>
			<div className="control-group">
				<label htmlFor="interval">定时频率</label>
				<select
					id="interval"
					name="interval"
					value={String(config.interval)} // 保证 value 是字符串
					onChange={handleChange}
				>
					<option value="15">15分钟</option>
					<option value="30">30分钟</option>
					<option value="60">1小时</option>
					<option value="120">2小时</option>
				</select>
			</div>
			<div className="control-group">
				<label htmlFor="taskType">任务类型</label>
				<select
					id="taskType"
					name="taskType"
					value={config.taskType}
					onChange={handleChange}
				>
					<option value="news">新闻汇总</option>
					<option value="hot">热点追踪</option>
					<option value="social">社交分析</option>
				</select>
			</div>
		</div>
	);
};

export default ControlPanel;
