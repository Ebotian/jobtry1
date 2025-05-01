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
				<label htmlFor="analysisKeyword">分析关键词</label>
				<input
					id="analysisKeyword"
					name="analysisKeyword"
					type="text"
					placeholder="如：AI、科技、社会..."
					value={config.analysisKeyword || ""}
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
				<label htmlFor="site">爬取站点</label>
				<select
					id="site"
					name="site"
					value={config.site}
					onChange={handleChange}
				>
					<option value="thepaper.cn">澎湃新闻</option>
					<option value="jiemian.com">界面新闻</option>
					<option value="bjnews.com.cn">新京报</option>
				</select>
			</div>
			<div className="control-group">
				<label htmlFor="manual-crawl">&nbsp;</label>
				<button
					id="manual-crawl"
					className="manual-crawl-btn"
					onClick={async () => {
						// 1. 保存参数
						const task = await taskService.createOrUpdateTask(config);
						// 2. 立即执行
						await axios.post(`/api/tasks/${task._id}/execute`);
						alert("已立即执行爬取任务！");
					}}
				>
					手动爬取
				</button>
			</div>
		</div>
	);
};

export default ControlPanel;
