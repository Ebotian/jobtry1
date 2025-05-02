import React, { useState, useEffect } from "react";
import "./HistoryPanel.css";
import * as taskService from "../api/taskService";

const HistoryPanel = ({ onSelect, selectedId, refreshKey }) => {
	const [results, setResults] = useState([]);

	useEffect(() => {
		let intervalId;
		const fetchResults = async () => {
			try {
				const all = await taskService.getTaskResults();
				setResults(all);
			} catch (err) {
				console.error("获取历史记录失败", err);
			}
		};
		// 首次加载
		fetchResults();
		// 每15秒拉取一次
		intervalId = setInterval(fetchResults, 15000);
		return () => clearInterval(intervalId);
	}, [refreshKey]);

	return (
		<div className="history-root">
			<h3 className="history-title">任务历史记录</h3>
			<div className="history-list">
				{results.map((item) => (
					<div
						className={`history-item${
							item._id === selectedId ? " selected" : ""
						}`}
						key={item._id}
						onClick={() => onSelect && onSelect(item._id)}
					>
						<div className="history-meta">
							<span className="history-time">
								{new Date(item.createdAt).toLocaleString()}
							</span>
							<span className="history-keyword">
								关键词: {item.config?.analysisKeyword || "无"}
							</span>
						</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default HistoryPanel;
