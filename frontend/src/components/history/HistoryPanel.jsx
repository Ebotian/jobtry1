import React, { useState } from "react";
import "./HistoryPanel.css";

// 示例历史数据
const sampleHistory = [
	{
		time: "",
		type: "",
		keyword: "",
		summary: "暂无历史记录",
	},
];

const HistoryPanel = () => {
	const [history] = useState(sampleHistory);

	return (
		<div className="history-root">
			<h3 className="history-title">任务历史记录</h3>
			<div className="history-list">
				{history.map((item, idx) => (
					<div className="history-item" key={idx}>
						<div className="history-meta">
							<span className="history-time">{item.time}</span>
							<span className="history-type">{item.type}</span>
							<span className="history-keyword">关键词: {item.keyword}</span>
						</div>
						<div className="history-summary">{item.summary}</div>
					</div>
				))}
			</div>
		</div>
	);
};

export default HistoryPanel;
