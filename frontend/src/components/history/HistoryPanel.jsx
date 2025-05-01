import React, { useState, useEffect } from "react";
import "./HistoryPanel.css";
import * as taskService from "../api/taskService";

const HistoryPanel = ({ onSelect, selectedId, refreshKey }) => {
	const [tasks, setTasks] = useState([]);

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const all = await taskService.getTasks();
				setTasks(all);
				// 默认选中最新
				if (all.length > 0 && onSelect) {
					onSelect(selectedId || all[all.length - 1]._id);
				}
			} catch (err) {
				console.error("获取历史记录失败", err);
			}
		};
		fetchTasks();
	}, [refreshKey]);

	return (
		<div className="history-root">
			<h3 className="history-title">任务历史记录</h3>
			<div className="history-list">
				{tasks
					.filter((item) => item.result && Object.keys(item.result).length > 0)
					.map((item) => (
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
									关键词: {item.config.analysisKeyword || "无"}
								</span>
							</div>
						</div>
					))}
			</div>
		</div>
	);
};

export default HistoryPanel;
