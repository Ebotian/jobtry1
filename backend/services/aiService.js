/**
 * AI服务模块 - 与DeepSeek API集成
 * 提供文本分析、摘要生成、情感分析等AI功能
 */

import axios from "axios";
import { promises as fs } from "fs";
import path from "path";
import logger from "../utils/logger.js";
import { config } from "../config/env.js";

class DeepSeekClient {
	constructor(apiKey) {
		this.apiKey = apiKey || config.DEEPSEEK_API_KEY;
		this.baseURL = "https://api.deepseek.com/v1";
		this.client = axios.create({
			baseURL: this.baseURL,
			headers: {
				Authorization: `Bearer ${this.apiKey}`,
				"Content-Type": "application/json",
			},
		});
	}

	/**
	 * 处理API请求错误
	 * @param {Error} error - 错误对象
	 * @throws {Error} 格式化的错误信息
	 */
	handleError(error) {
		const errorMessage = error.response?.data?.error?.message || error.message;
		logger.error(`DeepSeek API错误: ${errorMessage}`);
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
				style: "bullet_points",
				focus_keywords: [],
				max_length: 300,
				temperature: 0.3,
			};

			const mergedOptions = { ...defaultOptions, ...options };

			const response = await this.client.post("/summarize", {
				text,
				params: mergedOptions,
			});

			return response.data.summary;
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
			const response = await this.client.post("/analyze", {
				text,
				analysis_type: "sentiment",
				params: {
					detailed: true,
				},
			});

			return {
				sentiment: response.data.sentiment,
				score: response.data.score,
				details: response.data.details,
			};
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
			const response = await this.client.post("/analyze", {
				text,
				analysis_type: "topics",
				params: {
					top_n: topN,
				},
			});

			return response.data.topics;
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
				temperature: 0.1,
				max_tokens: 1000,
				top_p: 0.9,
			};

			const mergedOptions = { ...defaultOptions, ...options };

			const response = await this.client.post("/complete", {
				prompt: `${prompt}\n\n文本: ${text}`,
				...mergedOptions,
			});

			return response.data.choices[0].text;
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

// 导出单例实例
const aiService = new AIService();
export default aiService;

// 导出类以便在需要时创建新实例
export { AIService, DeepSeekClient, TextProcessor };
