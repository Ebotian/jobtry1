import React, { useState, useEffect } from "react";
import * as taskService from "../api/taskService";
import ReactMarkdown from "react-markdown";
import "./SummaryCard.css";

const SummaryCard = ({ selectedTaskId }) => {
	const [summary, setSummary] = useState("");
	const [rawResult, setRawResult] = useState(null);
	const [showRaw, setShowRaw] = useState(false);

	useEffect(() => {
		const fetchSummary = async () => {
			try {
				if (!selectedTaskId) return;
				// 查询历史结果集合
				const all = await taskService.getTaskResults();
				const resultDoc = all.find(
					(r) => String(r._id) === String(selectedTaskId)
				);
				if (!resultDoc) {
					setSummary("");
					setRawResult(null);
					return;
				}
				setSummary(resultDoc.result?.ai || resultDoc.result?.summary || "");
				setRawResult(resultDoc.result);
			} catch (err) {
				console.error("获取摘要失败", err);
			}
		};
		fetchSummary();
	}, [selectedTaskId]);

	const displaySummary = summary || "暂无摘要，请先运行任务或等待AI分析结果...";

	return (
		<div className="summary-root">
			<h3 className="summary-title">AI分析摘要</h3>
			<button className="summary-raw-btn" onClick={() => setShowRaw((v) => !v)}>
				{showRaw ? "隐藏原始数据" : "查看原始数据"}
			</button>
			<div className="summary-content">
				{showRaw && rawResult ? (
					<pre
						style={{
							fontSize: "0.98em",
							color: "#444",
							background: "#f6f6f6",
							borderRadius: 6,
							padding: 10,
							overflowX: "auto",
						}}
					>
						{JSON.stringify(rawResult, null, 2)}
					</pre>
				) : (
					<ReactMarkdown>{displaySummary}</ReactMarkdown>
				)}
			</div>
		</div>
	);
};

export default SummaryCard;
