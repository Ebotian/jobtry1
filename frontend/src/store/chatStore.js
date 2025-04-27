import { create } from "zustand";
import apiService from "../services/api";

/**
 * 聊天状态管理
 * 管理对话消息、摘要及相关状态
 */
const useChatStore = create((set, get) => ({
	// 消息列表
	messages: [
		{
			id: "1",
			type: "ai",
			content: "您好！我可以协助您分析数据，生成报告，甚至进行预测分析。",
			timestamp: new Date(),
		},
	],

	// 是否正在发送消息
	isSending: false,

	// 摘要内容
	summary: null,

	// 是否正在生成摘要
	isGeneratingSummary: false,

	// 添加消息
	addMessage: (message) => {
		set((state) => ({
			messages: [
				...state.messages,
				{
					id: message.id || Date.now().toString(),
					type: message.type || "user",
					content: message.content,
					timestamp: message.timestamp || new Date(),
				},
			],
		}));
	},

	// 发送消息
	sendMessage: async (content) => {
		if (!content.trim()) return;

		// 添加用户消息
		const userMessage = {
			id: Date.now().toString(),
			type: "user",
			content,
			timestamp: new Date(),
		};

		set((state) => ({
			messages: [...state.messages, userMessage],
			isSending: true,
		}));

		try {
			// 调用API获取回复
			const response = await apiService.sendChat(content);

			// 添加AI回复消息
			get().addMessage({
				id: (Date.now() + 1).toString(),
				type: "ai",
				content: response.reply || "我理解您的意思了。",
				timestamp: new Date(),
			});

			// 如果回复中包含摘要，则更新摘要
			if (response.summary) {
				set({ summary: response.summary });
			}
		} catch (error) {
			console.error("发送消息失败:", error);

			// 添加错误消息
			get().addMessage({
				id: (Date.now() + 1).toString(),
				type: "ai",
				content: "抱歉，发生了一些错误。请稍后再试。",
				timestamp: new Date(),
			});
		} finally {
			set({ isSending: false });
		}
	},

	// 生成摘要
	generateSummary: async () => {
		const { messages } = get();
		if (messages.length <= 1) return; // 至少需要用户发送一条消息

		set({ isGeneratingSummary: true });

		try {
			// 获取所有对话内容
			const chatContent = messages
				.map((m) => `${m.type === "user" ? "用户" : "AI"}: ${m.content}`)
				.join("\n");

			// 调用API生成摘要
			const response = await apiService.generateSummary(chatContent);

			set({ summary: response.summary });
		} catch (error) {
			console.error("生成摘要失败:", error);
		} finally {
			set({ isGeneratingSummary: false });
		}
	},

	// 清空对话
	clearChat: () => {
		set({
			messages: [
				{
					id: Date.now().toString(),
					type: "ai",
					content: "您好！我可以协助您分析数据，生成报告，甚至进行预测分析。",
					timestamp: new Date(),
				},
			],
			summary: null,
		});
	},
}));

export default useChatStore;
