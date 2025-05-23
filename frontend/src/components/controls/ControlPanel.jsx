import React, { useState, useEffect, useRef } from "react";
import "./ControlPanel.css";
import * as taskService from "../api/taskService";
import Switch from "rc-switch";
import "rc-switch/assets/index.css";

const ControlPanel = ({ config, onConfigChange, onHistoryRefresh }) => {
	const [loading, setLoading] = useState(false);
	// 本地 state 防抖分析关键词输入
	const [keywordInput, setKeywordInput] = useState(
		config.analysisKeyword || ""
	);
	const debounceRef = useRef(null);
	const [enableScheduler, setEnableScheduler] = useState(() => {
		const saved = localStorage.getItem("enableScheduler");
		return saved === null ? true : saved === "true";
	});
	const [countdown, setCountdown] = useState(() => {
		const saved = localStorage.getItem("schedulerCountdown");
		return saved !== null ? Number(saved) : config.interval * 60 || 0;
	});
	const countdownRef = useRef();

	// 定时任务开关切换
	const handleSchedulerToggle = async (checked) => {
		setEnableScheduler(checked);
		try {
			// 先确保任务已存在并同步 enableScheduler 字段
			const task = await taskService.createOrUpdateTask(config, checked);
			if (checked) {
				await taskService.startTask(task._id);
			} else {
				await taskService.stopTask(task._id);
			}
		} catch (err) {
			// 可选：提示用户操作失败
		}
	};

	// 定时倒计时逻辑
	useEffect(() => {
		localStorage.setItem("enableScheduler", enableScheduler);
	}, [enableScheduler]);

	useEffect(() => {
		if (!enableScheduler) {
			setCountdown(0);
			localStorage.setItem("schedulerCountdown", "0");
			if (countdownRef.current) clearInterval(countdownRef.current);
			return;
		}
		if (countdownRef.current) clearInterval(countdownRef.current);
		// 初始化倒计时
		setCountdown(config.interval * 60);
		localStorage.setItem("schedulerCountdown", String(config.interval * 60));

		// 视觉倒计时，无触发后端逻辑
		countdownRef.current = setInterval(() => {
			setCountdown((prev) => {
				const next = prev <= 1 ? config.interval * 60 : prev - 1;
				localStorage.setItem("schedulerCountdown", String(next));
				return next;
			});
		}, 1000);

		return () => {
			if (countdownRef.current) clearInterval(countdownRef.current);
		};
	}, [enableScheduler, config.interval]);

	// 自动提交参数到后端 for select controls
	const handleChange = async (e) => {
		const { name, value } = e.target;
		const newConfig = {
			...config,
			[name]: name === "interval" ? Number(value) : value,
		};
		if (onConfigChange) onConfigChange(newConfig);
		// 如果是 interval 或 site 变更，重置倒计时并持久化
		if (name === "interval" || name === "site") {
			const newCountdown =
				name === "interval" ? Number(value) * 60 : newConfig.interval * 60 || 0;
			setCountdown(newCountdown);
			localStorage.setItem("schedulerCountdown", String(newCountdown));
		}
		try {
			await taskService.createOrUpdateTask(newConfig);
			onHistoryRefresh && onHistoryRefresh();
		} catch (err) {
			console.error("任务参数提交失败", err);
		}
	};

	// 提交关键词至后端
	const commitKeyword = async (value) => {
		const newConfig = { ...config, analysisKeyword: value };
		if (onConfigChange) onConfigChange(newConfig);
		try {
			await taskService.createOrUpdateTask(newConfig);
			onHistoryRefresh && onHistoryRefresh();
		} catch (err) {
			console.error("关键词提交失败", err);
		}
	};

	// 本地输入变化
	const handleKeywordChange = (e) => {
		const val = e.target.value;
		setKeywordInput(val);
		if (debounceRef.current) clearTimeout(debounceRef.current);
		debounceRef.current = setTimeout(() => commitKeyword(val), 10000);
	};
	const handleKeywordKeyDown = (e) => {
		if (e.key === "Enter") {
			e.preventDefault();
			if (debounceRef.current) clearTimeout(debounceRef.current);
			commitKeyword(keywordInput);
		}
	};

	return (
		<div className="control-panel-root">
			{/* 分析关键词 */}
			<div className="control-group">
				<label htmlFor="analysisKeyword">分析关键词</label>
				<input
					id="analysisKeyword"
					name="analysisKeyword"
					type="text"
					placeholder="如：AI、科技、社会..."
					value={keywordInput}
					onChange={handleKeywordChange}
					onKeyDown={handleKeywordKeyDown}
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
					<option value="1">1分钟</option>
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
					disabled={loading}
					onClick={async () => {
						setLoading(true);
						try {
							// 1. 保存参数并获取任务
							const task = await taskService.createOrUpdateTask(config);
							// 2. 立即执行
							await taskService.executeTaskOnce(task._id);
							onHistoryRefresh && onHistoryRefresh();
							alert("已立即执行爬取任务！");
						} catch (err) {
							alert("手动爬取失败！");
						} finally {
							setLoading(false);
						}
					}}
				>
					{loading ? "正在执行..." : "手动爬取"}
				</button>
			</div>
			{/* 定时任务开关和倒计时，放最右侧 */}
			<div className="control-group control-group-scheduler">
				<label htmlFor="enableScheduler">定时任务</label>
				<div className="scheduler-toggle-row">
					<Switch
						id="enableScheduler"
						checked={enableScheduler}
						onChange={handleSchedulerToggle}
						className="scheduler-rc-switch"
					/>
					<span
						className={`scheduler-countdown${!enableScheduler ? " off" : ""}`}
					>
						{enableScheduler ? `倒计时：${countdown} 秒` : "已关闭"}
					</span>
				</div>
			</div>
		</div>
	);
};

export default ControlPanel;
