/**
 * @fileoverview 聊天状态管理
 *
 * 使用 Zustand 管理聊天状态，包括消息列表、加载状态等
 * 处理与 AI 服务的通信
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import aiService from "../services/aiService";

/**
 * 创建聊天状态管理存储
 */
const useChatStore = create(
	persist(
		(set, get) => ({
			// 消息列表
			messages: [],
			// 加载状态
			isLoading: false,
			// 错误信息
			error: null,
			// 当前会话ID
			sessionId: uuidv4(),

			/**
			 * 发送消息到 AI
			 * @param {string} content - 消息内容
			 */
			sendMessage: async (content) => {
				try {
					// 先添加用户消息
					const userMessage = {
						id: uuidv4(),
						type: "user",
						content,
						timestamp: new Date(),
					};

					set((state) => ({
						messages: [...state.messages, userMessage],
						isLoading: true,
						error: null,
					}));

					// 准备聊天历史记录
					const currentMessages = get().messages;
					// 只取最近的 10 条消息作为上下文
					const recentMessages = currentMessages.slice(-10).map((msg) => ({
						role: msg.type === "user" ? "user" : "assistant",
						content: msg.content,
					}));

					// 调用 AI 服务
					console.log("发送消息到 AI 服务:", content, recentMessages);
					const response = await aiService.chatWithAI(content, recentMessages);
					console.log("收到 AI 响应:", response);

					// 确保 response 不为 null 或 undefined
					if (!response) {
						throw new Error("未收到 AI 服务响应");
					}

					// 添加 AI 回复
					let aiContent = null;

					// 尝试处理不同的响应格式
					if (
						response.choices &&
						response.choices[0] &&
						response.choices[0].message
					) {
						aiContent = response.choices[0].message.content;
					} else if (response.response) {
						aiContent = response.response;
					} else if (typeof response === "string") {
						aiContent = response;
					} else if (typeof response === "object") {
						// 尝试找到响应中的文本内容
						aiContent = JSON.stringify(response);
					}

					// 如果所有尝试都失败，使用默认消息
					if (!aiContent) {
						aiContent = "抱歉，我现在无法回答这个问题。";
						console.warn("无法从响应中提取内容:", response);
					}

					const aiMessage = {
						id: uuidv4(),
						type: "ai",
						content: aiContent,
						timestamp: new Date(),
						rawResponse: response, // 存储原始响应
					};

					set((state) => ({
						messages: [...state.messages, aiMessage],
						isLoading: false,
					}));
				} catch (error) {
					console.error("发送消息失败:", error);

					// 添加错误消息
					const errorMessage = {
						id: uuidv4(),
						type: "error",
						content: error.message || "AI 服务暂时不可用，请稍后再试。",
						timestamp: new Date(),
					};

					set((state) => ({
						messages: [...state.messages, errorMessage],
						isLoading: false,
						error: error.message || "AI 服务暂时不可用",
					}));
				}
			},

			/**
			 * 添加消息到列表
			 * @param {Object} message - 消息对象
			 */
			addMessage: (message) =>
				set((state) => ({
					messages: [
						...state.messages,
						{
							id: uuidv4(),
							timestamp: new Date(),
							...message,
						},
					],
				})),

			/**
			 * 清空消息列表
			 */
			clearMessages: () => set({ messages: [], error: null }),

			/**
			 * 开始新会话
			 */
			startNewSession: () =>
				set({
					messages: [],
					sessionId: uuidv4(),
					error: null,
				}),
		}),
		{
			name: "chat-storage", // localStorage 键名
			getStorage: () => localStorage, // 使用 localStorage
			partialize: (state) => ({
				// 只持久化消息列表和会话 ID
				messages: state.messages,
				sessionId: state.sessionId,
			}),
		}
	)
);

export default useChatStore;
