/**
 * AI 相关路由处理
 * 提供聊天、摘要、情感分析等 AI 功能的 API
 */

import express from "express";
import { protect } from "../middlewares/auth.js"; // 修正导入语句，使用 protect 而不是 auth
import aiService from "../services/aiService.js";
import { logger } from "../utils/logger.js"; // 导入具体的 logger 对象而不是默认导出

const router = express.Router();

/**
 * @route POST /api/ai/chat
 * @desc 与 AI 聊天
 * @access Public (临时)
 */
router.post("/chat", async (req, res) => {
	try {
		const { message, history = [] } = req.body;

		if (!message) {
			return res.status(400).json({ error: { message: "消息内容不能为空" } });
		}

		// 构建消息格式，符合OpenAI兼容的格式
		const messages = [
			{
				role: "system",
				content:
					"你是一个助手，帮助用户分析和理解互联网数据。请提供专业、准确、简洁的回答。",
			},
		];

		// 添加历史消息
		if (history && history.length > 0) {
			history.forEach((msg) => {
				messages.push({
					role: msg.role, // 'user' 或 'assistant'
					content: msg.content,
				});
			});
		}

		// 添加用户当前的消息
		messages.push({
			role: "user",
			content: message,
		});

		logger.debug(`发送 DeepSeek 聊天请求: ${JSON.stringify(messages)}`);

		// 使用新的 chat 方法发送请求到 DeepSeek API
		const response = await aiService.chat(messages, {
			temperature: 0.7,
			max_tokens: 1000,
		});

		res.json( response );
	} catch (error) {
		logger.error(`AI 聊天错误: ${error.message}`);
		res
			.status(500)
			.json({
				error: {
					message: `AI 聊天错误: ${error.message}` || "AI 服务暂时不可用",
				},
			});
	}
});

/**
 * @route POST /api/ai/summarize
 * @desc 生成文本摘要
 * @access Private
 */
router.post("/summarize", protect, async (req, res) => {
	try {
		const { text, options = {} } = req.body;

		if (!text) {
			return res.status(400).json({ error: { message: "文本内容不能为空" } });
		}

		const summary = await aiService.summarize(text, options);
		res.json({ summary });
	} catch (error) {
		logger.error(`摘要生成错误: ${error.message}`); // 使用正确导入的 logger
		res
			.status(500)
			.json({ error: { message: error.message || "摘要生成失败" } });
	}
});

/**
 * @route POST /api/ai/sentiment
 * @desc 情感分析
 * @access Private
 */
router.post("/sentiment", protect, async (req, res) => {
	try {
		const { text } = req.body;

		if (!text) {
			return res.status(400).json({ error: { message: "文本内容不能为空" } });
		}

		const result = await aiService.analyzeSentiment(text);
		res.json(result);
	} catch (error) {
		logger.error(`情感分析错误: ${error.message}`); // 使用正确导入的 logger
		res
			.status(500)
			.json({ error: { message: error.message || "情感分析失败" } });
	}
});

/**
 * @route POST /api/ai/topics
 * @desc 主题提取
 * @access Private
 */
router.post("/topics", protect, async (req, res) => {
	try {
		const { text, topN = 5 } = req.body;

		if (!text) {
			return res.status(400).json({ error: { message: "文本内容不能为空" } });
		}

		const topics = await aiService.extractTopics(text, topN);
		res.json({ topics });
	} catch (error) {
		logger.error(`主题提取错误: ${error.message}`); // 使用正确导入的 logger
		res
			.status(500)
			.json({ error: { message: error.message || "主题提取失败" } });
	}
});

export default router;
