import React, { useRef, useState, useEffect } from "react";
import "./ChatContainer.css";
import * as taskService from "../api/taskService";
import ReactMarkdown from "react-markdown";

const MAX_CONTEXT = 5;

const ChatContainer = ({ config }) => {
	const [messages, setMessages] = useState([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const messagesBoxRef = useRef(null);

	// 滚动到底部
	useEffect(() => {
		if (messagesBoxRef.current) {
			messagesBoxRef.current.scrollTop = messagesBoxRef.current.scrollHeight;
		}
	}, [messages]);

	const handleSend = async () => {
		if (!input.trim() || loading) return;
		const userMsg = { role: "user", text: input };
		// 只允许 user/assistant，兼容历史 ai
		const context = messages.slice(-MAX_CONTEXT).map((m) => ({
			role: m.role === "ai" ? "assistant" : m.role,
			content: m.text,
		}));
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setLoading(true);
		try {
			const reply = await taskService.chatWithDeepseek(context, input);
			setMessages((prev) => [...prev, { role: "assistant", text: reply }]);
		} catch (err) {
			setMessages((prev) => [
				...prev,
				{ role: "assistant", text: "AI回复失败" },
			]);
		}
		setLoading(false);
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter") handleSend();
	};

	const handleClear = () => {
		setMessages([]);
	};

	return (
		<div className="chat-root">
			<div className="chat-header">
				<span>AI 聊天</span>
				<button className="chat-clear-btn" onClick={handleClear}>
					清空
				</button>
			</div>
			<div className="chat-messages sms-style" ref={messagesBoxRef}>
				{messages.length === 0 ? (
					<div className="chat-empty">暂无消息</div>
				) : (
					messages.map((msg, idx) => (
						<div
							key={idx}
							className={`chat-bubble ${msg.role === "user" ? "user" : "ai"}`}
						>
							<ReactMarkdown>{msg.text}</ReactMarkdown>
						</div>
					))
				)}
			</div>
			<div className="chat-input-row">
				<input
					className="chat-input"
					type="text"
					placeholder="请输入您的问题..."
					value={input}
					onChange={(e) => setInput(e.target.value)}
					onKeyDown={handleKeyDown}
					disabled={loading}
				/>
				<button
					className="chat-send-btn"
					onClick={handleSend}
					disabled={loading}
				>
					{loading ? "发送中..." : "发送"}
				</button>
			</div>
		</div>
	);
};

export default ChatContainer;
