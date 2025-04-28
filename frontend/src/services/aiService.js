/**
 * AI Service
 *
 * Handles all AI-related API operations.
 */

import api from "./api";

/**
 * Base URL for AI endpoints
 */
const BASE_URL = "/api/ai";

/**
 * AI Service
 */
const aiService = {
	/**
	 * Analyze text sentiment
	 * @param {string} text - Text to analyze
	 * @returns {Promise<{sentiment: number, analysis: Object}>} Sentiment analysis result
	 */
	analyzeSentiment: async (text) => {
		return api.post(`${BASE_URL}/sentiment`, { text });
	},

	/**
	 * Generate a summary for collected data
	 * @param {Object} data - The data to summarize
	 * @param {string} [data.taskId] - Optional task ID to summarize specific task data
	 * @param {Array} [data.results] - Optional results array to summarize
	 * @returns {Promise<{summary: string}>} Generated summary
	 */
	generateSummary: async (data) => {
		return api.post(`${BASE_URL}/summarize`, data);
	},

	/**
	 * Extract keywords from text
	 * @param {string} text - Text to extract keywords from
	 * @param {Object} [options] - Extraction options
	 * @param {number} [options.limit=10] - Maximum number of keywords to extract
	 * @returns {Promise<{keywords: Array<{text: string, score: number}>}>} Extracted keywords
	 */
	extractKeywords: async (text, options = {}) => {
		return api.post(`${BASE_URL}/keywords`, {
			text,
			...options,
		});
	},

	/**
	 * Generate a response to a user message in a chat context
	 * @param {string} message - User message
	 * @param {Array} [history=[]] - Previous chat history
	 * @returns {Promise<{response: string, context?: Object}>} AI generated response
	 */
	chatCompletion: async (message, history = []) => {
		return api.post(`${BASE_URL}/chat`, {
			message,
			history,
		});
	},

	/**
	 * Classify content into categories
	 * @param {string} content - Content to classify
	 * @param {Array<string>} [categories] - Optional predefined categories
	 * @returns {Promise<{category: string, confidence: number, alternativeCategories?: Array}>} Classification result
	 */
	classifyContent: async (content, categories) => {
		return api.post(`${BASE_URL}/classify`, {
			content,
			categories,
		});
	},

	/**
	 * Get visualization recommendations for data
	 * @param {Array} data - Dataset to visualize
	 * @param {Object} [options] - Visualization options
	 * @returns {Promise<{recommendations: Array, chartTypes: Array}>} Visualization recommendations
	 */
	getVisualizationRecommendations: async (data, options = {}) => {
		return api.post(`${BASE_URL}/visualize/recommend`, {
			data,
			options,
		});
	},

	/**
	 * Generate chart configuration for a specific chart type
	 * @param {Array} data - Dataset to visualize
	 * @param {string} chartType - Type of chart to generate
	 * @param {Object} [options] - Chart options
	 * @returns {Promise<{config: Object}>} Chart configuration
	 */
	generateChartConfig: async (data, chartType, options = {}) => {
		return api.post(`${BASE_URL}/visualize/config`, {
			data,
			chartType,
			options,
		});
	},
};

export default aiService;
