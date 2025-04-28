/**
 * @fileoverview AI 服务接口
 * 提供与后端 AI API 通信的功能，如聊天、摘要、情感分析等
 */

import api from "./api";

/**
 * 与 AI 进行聊天
 * @param {string} message - 用户消息
 * @param {Array} [history=[]] - 聊天历史记录
 * @returns {Promise<Object>} - 聊天响应
 */
export const chatWithAI = async (message, history = []) => {
	try {
		const response = await api.post("/ai/chat", {
			message,
			history,
		});
		return response.data;
	} catch (error) {
		console.error("AI 聊天请求失败:", error);
		throw new Error(
			error.response?.data?.error?.message || "与 AI 聊天失败，请稍后再试"
		);
	}
};

/**
 * 获取文本摘要
 * @param {string} text - 需要摘要的文本
 * @param {Object} [options={}] - 摘要选项
 * @returns {Promise<Object>} - 摘要响应
 */
export const getSummary = async (text, options = {}) => {
	try {
		const response = await api.post("/ai/summarize", {
			text,
			options,
		});
		return response.data;
	} catch (error) {
		console.error("获取摘要失败:", error);
		throw new Error(
			error.response?.data?.error?.message || "获取摘要失败，请稍后再试"
		);
	}
};

/**
 * 进行情感分析
 * @param {string} text - 需要分析的文本
 * @returns {Promise<Object>} - 情感分析结果
 */
export const analyzeSentiment = async (text) => {
	try {
		const response = await api.post("/ai/sentiment", {
			text,
		});
		return response.data;
	} catch (error) {
		console.error("情感分析失败:", error);
		throw new Error(
			error.response?.data?.error?.message || "情感分析失败，请稍后再试"
		);
	}
};

/**
 * 提取文本主题和关键词
 * @param {string} text - 需要分析的文本
 * @param {number} [topN=5] - 返回的主题数量
 * @returns {Promise<Object>} - 主题和关键词
 */
export const extractTopics = async (text, topN = 5) => {
	try {
		const response = await api.post("/ai/topics", {
			text,
			topN,
		});
		return response.data;
	} catch (error) {
		console.error("主题提取失败:", error);
		throw new Error(
			error.response?.data?.error?.message || "主题提取失败，请稍后再试"
		);
	}
};

export default {
	chatWithAI,
	getSummary,
	analyzeSentiment,
	extractTopics,
};
