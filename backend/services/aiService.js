/**
 * AI服务模块 - 与DeepSeek API集成
 * 提供文本分析、摘要生成、情感分析等AI功能
 */

import axios from "axios";
import { promises as fs } from "fs";
import path from "path";
import { logger } from "../utils/logger.js"; // 修改为导入具名对象
import config from "../config/env.js";

class DeepSeekClient {
	constructor(apiKey) {
		this.apiKey = apiKey || config.DEEPSEEK_API_KEY;
		// Update the baseURL to match DeepSeek's official API endpoint
		this.baseURL = "https://api.deepseek.com";
		this.client = axios.create({
			baseURL: this.baseURL,
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
		});
		logger.info(`初始化DeepSeek客户端，baseURL: ${this.baseURL}`);
	}

	/**
	 * 处理API请求错误
	 * @param {Error} error - 错误对象
	 * @throws {Error} 格式化的错误信息
	 */
	handleError(error) {
		const errorMessage = error.response?.data?.error?.message || error.message;
		logger.error(`DeepSeek API错误: ${errorMessage}`);
		logger.debug(
			`完整错误对象: ${JSON.stringify(error.response?.data || error.message)}`
		);
		throw new Error(`AI服务请求失败: ${errorMessage}`);
	}

	/**
	 * 生成文本摘要
	 * @param {string} text - 需要摘要的文本
	 * @param {Object} options - 摘要选项
	 * @returns {Promise<string>} 生成的摘要
	 */
	async generateSummary(text, options = {}) {
		try {
			const defaultOptions = {
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content: "请将以下文本生成简洁的摘要，保留关键信息。",
					},
					{
						role: "user",
						content: text,
					},
				],
				temperature: 0.3,
				max_tokens: 300,
			};

			const mergedOptions = {
				...defaultOptions,
				temperature: options.temperature || defaultOptions.temperature,
				max_tokens: options.max_length || defaultOptions.max_tokens,
			};

			logger.debug(`发送摘要请求: ${JSON.stringify(mergedOptions)}`);
			const response = await this.client.post(
				"/v1/chat/completions",
				mergedOptions
			);
			logger.debug(`摘要响应: ${JSON.stringify(response.data)}`);

			return response.data.choices[0].message.content;
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * 进行情感分析
	 * @param {string} text - 需要分析的文本
	 * @returns {Promise<Object>} 情感分析结果
	 */
	async analyzeSentiment(text) {
		try {
			const requestData = {
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content:
							"请对以下文本进行情感分析，返回JSON格式，包含sentiment(积极/消极/中性)、score(0-1的分数)和details(分析细节)",
					},
					{
						role: "user",
						content: text,
					},
				],
				temperature: 0.1,
				response_format: { type: "json_object" },
			};

			logger.debug(`发送情感分析请求: ${JSON.stringify(requestData)}`);
			const response = await this.client.post(
				"/v1/chat/completions",
				requestData
			);
			logger.debug(`情感分析响应: ${JSON.stringify(response.data)}`);

			const content = response.data.choices[0].message.content;

			try {
				const result = JSON.parse(content);
				return {
					sentiment: result.sentiment,
					score: result.score,
					details: result.details,
				};
			} catch (e) {
				// If JSON parsing fails, return a structured format anyway
				return {
					sentiment: "unknown",
					score: 0.5,
					details: content,
				};
			}
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * 提取文本主题和关键词
	 * @param {string} text - 需要分析的文本
	 * @param {number} topN - 返回的主题数量
	 * @returns {Promise<Array>} 主题和关键词列表
	 */
	async extractTopics(text, topN = 5) {
		try {
			const requestData = {
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content: `请从以下文本中提取最重要的${topN}个主题，以JSON数组格式返回`,
					},
					{
						role: "user",
						content: text,
					},
				],
				temperature: 0.1,
				response_format: { type: "json_object" },
			};

			logger.debug(`发送主题提取请求: ${JSON.stringify(requestData)}`);
			const response = await this.client.post(
				"/v1/chat/completions",
				requestData
			);
			logger.debug(`主题提取响应: ${JSON.stringify(response.data)}`);

			const content = response.data.choices[0].message.content;

			try {
				const result = JSON.parse(content);
				return result.topics || result;
			} catch (e) {
				// If JSON parsing fails, return the raw text
				return [content];
			}
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * 对文本进行自定义分析
	 * @param {string} text - 需要分析的文本
	 * @param {string} prompt - 自定义提示词
	 * @param {Object} options - 分析选项
	 * @returns {Promise<Object>} 分析结果
	 */
	async customAnalysis(text, prompt, options = {}) {
		try {
			const defaultOptions = {
				temperature: 0.7,
				max_tokens: 1000,
				top_p: 0.9,
			};

			const mergedOptions = { ...defaultOptions, ...options };

			const requestData = {
				model: "deepseek-chat",
				messages: [
					{
						role: "system",
						content: prompt,
					},
					{
						role: "user",
						content: text,
					},
				],
				temperature: mergedOptions.temperature,
				max_tokens: mergedOptions.max_tokens,
				top_p: mergedOptions.top_p,
			};

			logger.debug(`发送自定义分析请求: ${JSON.stringify(requestData)}`);
			const response = await this.client.post(
				"/v1/chat/completions",
				requestData
			);
			logger.debug(`自定义分析响应: ${JSON.stringify(response.data)}`);

			return response.data.choices[0].message.content;
		} catch (error) {
			this.handleError(error);
		}
	}

	/**
	 * 进行AI聊天
	 * @param {Array} messages - 聊天消息数组，格式为 [{role: 'user'|'assistant'|'system', content: 'message'}]
	 * @param {Object} options - 聊天选项
	 * @returns {Promise<Object>} 聊天响应
	 */
	async chat(messages, options = {}) {
		try {
			const defaultOptions = {
				temperature: 0.7,
				max_tokens: 1000,
				top_p: 0.9,
			};

			const mergedOptions = { ...defaultOptions, ...options };

			const requestData = {
				model: "deepseek-chat",
				messages: messages,
				temperature: mergedOptions.temperature,
				max_tokens: mergedOptions.max_tokens,
				top_p: mergedOptions.top_p,
			};

			logger.debug(`发送聊天请求: ${JSON.stringify(requestData)}`);
			const response = await this.client.post(
				"/v1/chat/completions",
				requestData
			);
			logger.debug(`聊天响应: ${JSON.stringify(response.data)}`);

			return response.data.choices[0].message.content;
		} catch (error) {
			this.handleError(error);
		}
	}
}

class TextProcessor {
	/**
	 * 预处理文本
	 * @param {string} text - 原始文本
	 * @returns {string} 预处理后的文本
	 */
	static preprocess(text) {
		if (!text || typeof text !== "string") {
			throw new Error("无效的文本输入");
		}

		// 移除多余空白
		let processed = text.trim().replace(/\s+/g, " ");

		// 移除特殊字符
		processed = processed.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "");

		return processed;
	}

	/**
	 * 将文本分割为较小的块
	 * @param {string} text - 原始文本
	 * @param {number} maxLength - 每块最大长度
	 * @returns {Array<string>} 文本块数组
	 */
	static splitIntoChunks(text, maxLength = 4000) {
		const chunks = [];
		let currentChunk = "";

		// 按句子分割
		const sentences = text.split(/(?<=[.!?])\s+/);

		for (const sentence of sentences) {
			if ((currentChunk + sentence).length <= maxLength) {
				currentChunk += (currentChunk ? " " : "") + sentence;
			} else {
				if (currentChunk) {
					chunks.push(currentChunk);
				}
				currentChunk = sentence;
			}
		}

		if (currentChunk) {
			chunks.push(currentChunk);
		}

		return chunks;
	}

	/**
	 * 格式化分析结果
	 * @param {Object} result - 分析结果
	 * @param {string} format - 目标格式 (json, markdown, html)
	 * @returns {string} 格式化后的结果
	 */
	static formatResult(result, format = "json") {
		switch (format.toLowerCase()) {
			case "json":
				return typeof result === "string"
					? result
					: JSON.stringify(result, null, 2);
			case "markdown":
				if (typeof result === "string") {
					return result;
				}

				if (result.summary) {
					return `# 摘要\n\n${result.summary}`;
				} else if (result.sentiment) {
					return `# 情感分析\n\n- 情感: ${result.sentiment}\n- 分数: ${result.score}\n`;
				} else if (Array.isArray(result)) {
					return `# 分析结果\n\n${result
						.map((item) => `- ${item}`)
						.join("\n")}`;
				}
				return JSON.stringify(result, null, 2);
			case "html":
				// HTML格式化逻辑
				if (typeof result === "string") {
					return `<div>${result.replace(/\n/g, "<br>")}</div>`;
				}
				return `<pre>${JSON.stringify(result, null, 2)}</pre>`;
			default:
				return typeof result === "string"
					? result
					: JSON.stringify(result, null, 2);
		}
	}
}

/**
 * AI服务类 - 封装所有AI相关功能
 */
class AIService {
	constructor(apiKey) {
		this.client = new DeepSeekClient(apiKey);
		this.lastAnalysisTime = null;
		this.requestCount = 0;
	}

	/**
	 * 与AI进行对话
	 * @param {Array} messages - 聊天消息数组，格式为 [{role: 'user'|'assistant'|'system', content: 'message'}]
	 * @param {Object} options - 聊天选项
	 * @returns {Promise<string>} 聊天响应内容
	 */
	async chat(messages, options = {}) {
		try {
			logger.info(`发送 DeepSeek 聊天请求: ${JSON.stringify(messages)}`);
			const response = await this.client.chat(messages, options);
			return response;
		} catch (error) {
			logger.error(`AI 聊天错误: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 生成文本摘要
	 * @param {string} text - 需要摘要的文本
	 * @param {Object} options - 摘要选项
	 * @returns {Promise<string>} 生成的摘要
	 */
	async summarize(text, options = {}) {
		try {
			const processedText = TextProcessor.preprocess(text);

			// 文本太长时进行分块处理
			if (processedText.length > 8000) {
				const chunks = TextProcessor.splitIntoChunks(processedText);
				const summaries = await Promise.all(
					chunks.map((chunk) => this.client.generateSummary(chunk, options))
				);

				// 合并各块摘要
				const combinedSummary = summaries.join("\n\n");

				// 如果合并后摘要仍很长，进行二次摘要
				if (combinedSummary.length > 2000) {
					return this.client.generateSummary(combinedSummary, {
						...options,
						max_length: Math.min(options.max_length || 300, 500),
					});
				}

				return combinedSummary;
			}

			return this.client.generateSummary(processedText, options);
		} catch (error) {
			logger.error(`摘要生成错误: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 分析文本情感
	 * @param {string} text - 需要分析的文本
	 * @returns {Promise<Object>} 情感分析结果
	 */
	async analyzeSentiment(text) {
		try {
			const processedText = TextProcessor.preprocess(text);
			return this.client.analyzeSentiment(processedText);
		} catch (error) {
			logger.error(`情感分析错误: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 提取文本主题
	 * @param {string} text - 需要分析的文本
	 * @param {number} topN - 返回的主题数量
	 * @returns {Promise<Array>} 主题列表
	 */
	async extractTopics(text, topN = 5) {
		try {
			const processedText = TextProcessor.preprocess(text);
			return this.client.extractTopics(processedText, topN);
		} catch (error) {
			logger.error(`主题提取错误: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 分析舆情热点
	 * @param {Array<string>} texts - 文本数组
	 * @returns {Promise<Object>} 舆情分析结果
	 */
	async analyzePublicOpinion(texts) {
		try {
			if (!Array.isArray(texts) || texts.length === 0) {
				throw new Error("文本输入必须是非空数组");
			}

			const joinedText = texts.join("\n\n");
			const processedText = TextProcessor.preprocess(joinedText);

			const prompt =
				"请分析以下多条文本中的舆情热点，总结主要话题、情感倾向及关注度。返回JSON格式，包含主题列表、总体情感和关键词。";

			const result = await this.client.customAnalysis(processedText, prompt, {
				temperature: 0.2,
				max_tokens: 1500,
			});

			try {
				// 尝试将结果解析为JSON
				return JSON.parse(result.replace(/```json|```/g, "").trim());
			} catch (e) {
				// 如果解析失败，返回原始文本
				return { analysis: result };
			}
		} catch (error) {
			logger.error(`舆情分析错误: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 自定义AI分析
	 * @param {string} message - 用户消息
	 * @param {string} contextPrompt - 上下文提示词
	 * @param {Object} options - 分析选项
	 * @returns {Promise<string>} 分析结果
	 */
	async customAnalysis(message, contextPrompt, options = {}) {
		try {
			logger.info(`执行自定义AI分析: ${message.substring(0, 50)}...`);
			const processedText = TextProcessor.preprocess(message);
			const result = await this.client.customAnalysis(
				processedText,
				contextPrompt,
				options
			);
			return result;
		} catch (error) {
			logger.error(`自定义AI分析错误: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 将分析结果保存到文件
	 * @param {Object|string} result - 分析结果
	 * @param {string} filename - 文件名
	 * @param {string} format - 文件格式
	 * @returns {Promise<string>} 文件路径
	 */
	async saveResultToFile(result, filename, format = "json") {
		try {
			const formattedResult = TextProcessor.formatResult(result, format);
			const extension =
				format.toLowerCase() === "markdown" ? "md" : format.toLowerCase();
			const filePath = path.join(
				process.cwd(),
				"results",
				`${filename}.${extension}`
			);

			// 确保目录存在
			await fs.mkdir(path.dirname(filePath), { recursive: true });

			await fs.writeFile(filePath, formattedResult, "utf8");
			logger.info(`分析结果已保存到: ${filePath}`);

			return filePath;
		} catch (error) {
			logger.error(`保存结果错误: ${error.message}`);
			throw error;
		}
	}
}

// 导出AIService的单例实例
const aiService = new AIService();
export default aiService;

// 导出类以便在需要时创建新实例
export { AIService, DeepSeekClient, TextProcessor };
