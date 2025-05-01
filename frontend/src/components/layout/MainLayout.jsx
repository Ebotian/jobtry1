import React, { useState } from "react";
import "./MainLayout.css";
import Sidebar from "../sidebar/Sidebar";
import ControlPanel from "../controls/ControlPanel";
import ChatContainer from "../chat/ChatContainer";
import SummaryCard from "../summary/SummaryCard";
import HistoryPanel from "../history/HistoryPanel";

const defaultConfig = {
	analysisKeyword: "",
	interval: 60,
	site: "thepaper.cn",
};

const MainLayout = () => {
	const [taskConfig, setTaskConfig] = useState(defaultConfig);
	// 用于触发 HistoryPanel 刷新
	const [historyRefreshKey, setHistoryRefreshKey] = useState(0);

	const [selectedTaskId, setSelectedTaskId] = useState(null);

	return (
		<div className="main-layout">
			{/* 左侧侧边栏 */}
			<aside className="sidebar">
				<Sidebar />
			</aside>
			{/* 主内容区域 */}
			<main className="content">
				{/* 顶部：任务参数配置 */}
				<section className="control-panel" id="section-home">
					<ControlPanel
						config={taskConfig}
						onConfigChange={setTaskConfig}
						onHistoryRefresh={() => setHistoryRefreshKey((prev) => prev + 1)}
					/>
				</section>
				{/* 中部：聊天界面 */}
				<section className="chat-summary" id="section-analysis">
					<div className="chat-container">
						<ChatContainer config={taskConfig} onConfigChange={setTaskConfig} />
					</div>
					<div className="history-panel" id="section-history">
						<HistoryPanel
							onSelect={setSelectedTaskId}
							selectedId={selectedTaskId}
							refreshKey={historyRefreshKey}
						/>
					</div>
				</section>
				{/* 底部：摘要区域 */}
				<section className="summary-area">
					<SummaryCard selectedTaskId={selectedTaskId} />
				</section>
				{/* 设置区域预留 */}
				<section style={{ display: "none" }} id="section-settings"></section>
			</main>
		</div>
	);
};

export default MainLayout;
