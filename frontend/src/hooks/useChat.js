/**
 * @fileoverview 聊天功能自定义 Hook
 * 提供聊天界面所需的状态管理和逻辑处理，与后端 AI 服务交互
 */

import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

// 导入服务和工具
import aiService from "../services/aiService";
import { getStorageItem, setStorageItem } from "../utils/helpers";

// 聊天消息类型枚举
const MessageType = {
	USER: "user",
	AI: "ai",
	SYSTEM: "system",
	ERROR: "error",
};

/**
 * 创建初始聊天消息
 * @returns {Array} 初始消息数组
 */
const createInitialMessages = () => [
	{
		id: uuidv4(),
		type: MessageType.SYSTEM,
		content: "您好，我是智能助手。请问有什么可以帮到您？",
		timestamp: new Date(),
	},
];

/**
 * 聊天功能自定义 Hook
 * @param {Object} options - 配置选项
 * @param {string} [options.chatId] - 聊天会话ID，不提供则创建新会话
 * @param {boolean} [options.loadHistory=true] - 是否加载历史消息
 * @param {number} [options.maxHistoryLength=50] - 最大历史消息数量
 * @returns {Object} 聊天状态和操作方法
 */
const useChat = (options = {}) => {
	const {
		chatId: initialChatId,
		loadHistory = true,
		maxHistoryLength = 50,
	} = options;

	// 使用引用保存当前会话 ID
	const chatIdRef = useRef(initialChatId || uuidv4());

	// 聊天状态
	const [messages, setMessages] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);

	// 用于路由导航
	const navigate = useNavigate();

	/**
	 * 格式化消息对象
	 * @param {string} content - 消息内容
	 * @param {string} type - 消息类型
	 * @returns {Object} 格式化的消息对象
	 */
	const formatMessage = useCallback((content, type = MessageType.USER) => {
		return {
			id: uuidv4(),
			type,
			content,
			timestamp: new Date(),
		};
	}, []);

	/**
	 * 添加新消息到消息列表
	 * @param {string} content - 消息内容
	 * @param {string} type - 消息类型
	 */
	const addMessage = useCallback(
		(content, type = MessageType.USER) => {
			const newMessage = formatMessage(content, type);

			setMessages((prevMessages) => {
				// 确保不超过最大历史长度
				const updatedMessages = [...prevMessages, newMessage];
				if (updatedMessages.length > maxHistoryLength) {
					// 保留系统欢迎消息和最新的消息
					const firstMessage = updatedMessages[0];
					const latestMessages = updatedMessages.slice(-(maxHistoryLength - 1));
					return [firstMessage, ...latestMessages];
				}
				return updatedMessages;
			});

			return newMessage;
		},
		[formatMessage, maxHistoryLength]
	);

	/**
	 * 保存聊天历史到本地存储
	 */
	const saveHistory = useCallback(() => {
		// 获取现有的聊天历史记录
		const chatHistory = getStorageItem("chatHistory", {});

		// 更新当前会话的消息
		chatHistory[chatIdRef.current] = {
			id: chatIdRef.current,
			messages: messages,
			lastUpdated: new Date().toISOString(),
		};

		// 保存回本地存储
		setStorageItem("chatHistory", chatHistory);
	}, [messages]);

	/**
	 * 加载聊天历史
	 */
	const loadChatHistory = useCallback(() => {
		if (!loadHistory) return;

		try {
			const chatHistory = getStorageItem("chatHistory", {});
			const currentChat = chatHistory[chatIdRef.current];

			// 如果找到当前会话的历史记录，则加载
			if (
				currentChat &&
				Array.isArray(currentChat.messages) &&
				currentChat.messages.length > 0
			) {
				setMessages(currentChat.messages);
			} else {
				// 否则创建新的初始消息
				setMessages(createInitialMessages());
			}
		} catch (err) {
			console.error("加载聊天历史出错:", err);
			setMessages(createInitialMessages());
		}
	}, [loadHistory]);

	/**
	 * 发送消息到 AI 服务并获取回复
	 * @param {string} messageText - 用户消息文本
	 * @param {Object} [options={}] - 额外选项，如 creativity
	 * @returns {Promise<Object>} 包含发送状态的对象
	 */
	const sendMessage = useCallback(
		async (messageText, options = {}) => {
			if (!messageText.trim()) return { success: false };

			try {
				// 添加用户消息到列表
				const userMessage = addMessage(messageText, MessageType.USER);

				// 设置加载状态
				setIsLoading(true);
				setError(null);

				// 准备发送到 AI 服务的历史消息
				const messageHistory = messages
					.filter(
						(msg) =>
							msg.type === MessageType.USER || msg.type === MessageType.AI
					)
					.map((msg) => ({
						role: msg.type === MessageType.USER ? "user" : "assistant",
						content: msg.content,
					}));

				// 调用 AI 服务获取回复，支持 options
				const response = await aiService.chatWithAI(
					messageText,
					messageHistory,
					options
				);

				// 兼容 OpenAI/DeepSeek 格式，提取 content
				let aiContent = "";
				if (
					response.choices &&
					response.choices[0] &&
					response.choices[0].message &&
					response.choices[0].message.content
				) {
					aiContent = response.choices[0].message.content;
				} else {
					aiContent = JSON.stringify(response);
				}

				// 添加 AI 回复到消息列表，rawResponse 保留完整响应
				addMessage(aiContent, MessageType.AI);

				return { success: true, aiContent, rawResponse: response };
			} catch (err) {
				console.error("发送消息出错:", err);
				setError(err.message || "发送消息失败，请稍后重试");

				// 添加错误消息
				addMessage(
					`发送消息失败: ${err.message || "未知错误"}`,
					MessageType.ERROR
				);

				return { success: false, error: err };
			} finally {
				setIsLoading(false);
			}
		},
		[messages, addMessage]
	);

	/**
	 * 清空当前聊天消息
	 */
	const clearChat = useCallback(() => {
		setMessages(createInitialMessages());
	}, []);

	/**
	 * 切换到新的聊天会话
	 * @param {string} [newChatId] - 新的聊天ID，不提供则创建新ID
	 */
	const switchChat = useCallback(
		(newChatId) => {
			const nextChatId = newChatId || uuidv4();
			chatIdRef.current = nextChatId;

			// 加载新聊天的历史或创建新的聊天
			loadChatHistory();

			// 可选：更新URL以反映新的聊天会话
			navigate(`/chat/${nextChatId}`, { replace: true });
		},
		[loadChatHistory, navigate]
	);

	/**
	 * 获取当前聊天的上下文摘要
	 * @returns {string} 聊天上下文摘要
	 */
	const getChatSummary = useCallback(() => {
		// 获取最近的消息作为摘要
		const recentMessages = messages
			.filter((msg) => msg.type !== MessageType.SYSTEM)
			.slice(-3);

		if (recentMessages.length === 0) {
			return "新的对话";
		}

		// 使用第一条消息的前20个字符作为摘要
		const firstUserMsg = recentMessages.find(
			(msg) => msg.type === MessageType.USER
		);
		if (firstUserMsg) {
			const summary = firstUserMsg.content.substring(0, 20);
			return summary + (firstUserMsg.content.length > 20 ? "..." : "");
		}

		return "对话 " + chatIdRef.current.substring(0, 8);
	}, [messages]);

	// 副作用：初始加载聊天历史
	useEffect(() => {
		loadChatHistory();
	}, [loadChatHistory]);

	// 副作用：保存聊天历史
	useEffect(() => {
		if (messages.length > 0) {
			saveHistory();
		}
	}, [messages, saveHistory]);

	// 导出的状态和方法
	return {
		messages,
		isLoading,
		error,
		sendMessage,
		addMessage,
		clearChat,
		switchChat,
		getChatSummary,
		chatId: chatIdRef.current,
		MessageType,
	};
};

export default useChat;
