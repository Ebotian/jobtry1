/**
 * @fileoverview 格式化工具函数
 * 提供各种用于格式化日期、数字、文本和数据的实用函数
 */

/**
 * 日期格式化函数
 */

/**
 * 将日期格式化为标准日期字符串（YYYY-MM-DD）
 * @param {Date|string|number} date - 要格式化的日期
 * @param {string} [locale='zh-CN'] - 地区设置
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, locale = "zh-CN") => {
	if (!date) return "";

	const dateObj = date instanceof Date ? date : new Date(date);

	if (isNaN(dateObj.getTime())) return "";

	return dateObj
		.toLocaleDateString(locale, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
		.replace(/\//g, "-");
};

/**
 * 将日期格式化为日期时间字符串（YYYY-MM-DD HH:MM:SS）
 * @param {Date|string|number} date - 要格式化的日期
 * @param {string} [locale='zh-CN'] - 地区设置
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date, locale = "zh-CN") => {
	if (!date) return "";

	const dateObj = date instanceof Date ? date : new Date(date);

	if (isNaN(dateObj.getTime())) return "";

	const dateString = dateObj
		.toLocaleDateString(locale, {
			year: "numeric",
			month: "2-digit",
			day: "2-digit",
		})
		.replace(/\//g, "-");

	const timeString = dateObj.toLocaleTimeString(locale, {
		hour: "2-digit",
		minute: "2-digit",
		second: "2-digit",
		hour12: false,
	});

	return `${dateString} ${timeString}`;
};

/**
 * 将日期格式化为相对时间（例如：3分钟前）
 * @param {Date|string|number} date - 要格式化的日期
 * @returns {string} 相对时间字符串
 */
export const formatTimeAgo = (date) => {
	if (!date) return "";

	const dateObj = date instanceof Date ? date : new Date(date);

	if (isNaN(dateObj.getTime())) return "";

	const now = new Date();
	const diffMs = now - dateObj;
	const diffSec = Math.floor(diffMs / 1000);
	const diffMin = Math.floor(diffSec / 60);
	const diffHour = Math.floor(diffMin / 60);
	const diffDay = Math.floor(diffHour / 24);
	const diffMonth = Math.floor(diffDay / 30);
	const diffYear = Math.floor(diffMonth / 12);

	if (diffSec < 60) {
		return `${diffSec}秒前`;
	} else if (diffMin < 60) {
		return `${diffMin}分钟前`;
	} else if (diffHour < 24) {
		return `${diffHour}小时前`;
	} else if (diffDay < 30) {
		return `${diffDay}天前`;
	} else if (diffMonth < 12) {
		return `${diffMonth}个月前`;
	} else {
		return `${diffYear}年前`;
	}
};

/**
 * 格式化时间段（例如：2小时30分钟）
 * @param {number} minutes - 总分钟数
 * @returns {string} 格式化后的时间段
 */
export const formatDuration = (minutes) => {
	if (!minutes && minutes !== 0) return "";

	const hours = Math.floor(minutes / 60);
	const mins = minutes % 60;

	if (hours === 0) {
		return `${mins}分钟`;
	} else if (mins === 0) {
		return `${hours}小时`;
	} else {
		return `${hours}小时${mins}分钟`;
	}
};

/**
 * 数字格式化函数
 */

/**
 * 格式化数字，添加千分位分隔符
 * @param {number} num - 要格式化的数字
 * @param {number} [decimalPlaces=0] - 小数位数
 * @param {string} [locale='zh-CN'] - 地区设置
 * @returns {string} 格式化后的数字字符串
 */
export const formatNumber = (num, decimalPlaces = 0, locale = "zh-CN") => {
	if (num === null || num === undefined || isNaN(num)) return "";

	return new Intl.NumberFormat(locale, {
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces,
	}).format(num);
};

/**
 * 格式化货币
 * @param {number} amount - 金额
 * @param {string} [currency='CNY'] - 货币代码
 * @param {string} [locale='zh-CN'] - 地区设置
 * @returns {string} 格式化后的货币字符串
 */
export const formatCurrency = (amount, currency = "CNY", locale = "zh-CN") => {
	if (amount === null || amount === undefined || isNaN(amount)) return "";

	return new Intl.NumberFormat(locale, {
		style: "currency",
		currency,
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	}).format(amount);
};

/**
 * 格式化百分比
 * @param {number} value - 百分比值（0-1）
 * @param {number} [decimalPlaces=2] - 小数位数
 * @param {string} [locale='zh-CN'] - 地区设置
 * @returns {string} 格式化后的百分比字符串
 */
export const formatPercentage = (
	value,
	decimalPlaces = 2,
	locale = "zh-CN"
) => {
	if (value === null || value === undefined || isNaN(value)) return "";

	return new Intl.NumberFormat(locale, {
		style: "percent",
		minimumFractionDigits: decimalPlaces,
		maximumFractionDigits: decimalPlaces,
	}).format(value);
};

/**
 * 格式化文件大小
 * @param {number} bytes - 字节数
 * @param {number} [decimalPlaces=2] - 小数位数
 * @returns {string} 格式化后的文件大小字符串
 */
export const formatFileSize = (bytes, decimalPlaces = 2) => {
	if (bytes === null || bytes === undefined || isNaN(bytes)) return "";

	if (bytes === 0) return "0 B";

	const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const base = 1024;

	const exponent = Math.floor(Math.log(bytes) / Math.log(base));
	const value = bytes / Math.pow(base, exponent);

	return `${value.toFixed(decimalPlaces)} ${units[exponent]}`;
};

/**
 * 文本格式化函数
 */

/**
 * 截断文本，超过最大长度时添加省略号
 * @param {string} text - 要截断的文本
 * @param {number} maxLength - 最大长度
 * @param {string} [ellipsis='...'] - 省略号
 * @returns {string} 截断后的文本
 */
export const truncateText = (text, maxLength, ellipsis = "...") => {
	if (!text) return "";

	if (text.length <= maxLength) return text;

	return `${text.substring(0, maxLength)}${ellipsis}`;
};

/**
 * 将文本首字母大写
 * @param {string} text - 要转换的文本
 * @returns {string} 首字母大写的文本
 */
export const capitalizeText = (text) => {
	if (!text) return "";

	return text.charAt(0).toUpperCase() + text.slice(1);
};

/**
 * 格式化情感分析结果
 * @param {number} sentimentScore - 情感分数 (-1 到 1)
 * @returns {Object} 包含情感类型和描述的对象
 */
export const formatSentiment = (sentimentScore) => {
	if (
		sentimentScore === null ||
		sentimentScore === undefined ||
		isNaN(sentimentScore)
	) {
		return { type: "neutral", label: "中性" };
	}

	if (sentimentScore >= 0.6) {
		return { type: "very-positive", label: "非常积极" };
	} else if (sentimentScore >= 0.2) {
		return { type: "positive", label: "积极" };
	} else if (sentimentScore > -0.2) {
		return { type: "neutral", label: "中性" };
	} else if (sentimentScore > -0.6) {
		return { type: "negative", label: "消极" };
	} else {
		return { type: "very-negative", label: "非常消极" };
	}
};

/**
 * 高亮文本中的关键词
 * @param {string} text - 原始文本
 * @param {string|Array<string>} keywords - 要高亮的关键词或关键词数组
 * @param {string} [highlightClass='highlight'] - 高亮标签的 CSS 类
 * @returns {string} 含有 HTML 高亮标记的字符串
 */
export const highlightKeywords = (
	text,
	keywords,
	highlightClass = "highlight"
) => {
	if (!text) return "";
	if (!keywords || (Array.isArray(keywords) && keywords.length === 0))
		return text;

	const keywordArray = Array.isArray(keywords) ? keywords : [keywords];

	// 转义正则表达式特殊字符
	const escapeRegExp = (string) => {
		return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	};

	let result = text;

	keywordArray.forEach((keyword) => {
		if (keyword) {
			const regex = new RegExp(escapeRegExp(keyword), "gi");
			result = result.replace(
				regex,
				(match) => `<span class="${highlightClass}">${match}</span>`
			);
		}
	});

	return result;
};

/**
 * 数据格式化函数
 */

/**
 * 格式化任务状态
 * @param {boolean} isActive - 任务是否激活
 * @param {Date|string|null} lastRunAt - 任务最后运行时间
 * @returns {Object} 包含状态类型和标签的对象
 */
export const formatTaskStatus = (isActive, lastRunAt) => {
	if (isActive) {
		return { type: "active", label: "运行中" };
	} else if (lastRunAt) {
		return { type: "paused", label: "已暂停" };
	} else {
		return { type: "idle", label: "未启动" };
	}
};

/**
 * 为图表格式化数据
 * @param {Array} data - 原始数据
 * @param {string} type - 图表类型
 * @param {Object} [options={}] - 额外选项
 * @returns {Object} 格式化后的图表数据
 */
export const formatChartData = (data, type, options = {}) => {
	if (!data || !Array.isArray(data)) return null;

	// 根据图表类型进行不同的处理
	switch (type) {
		case "line":
		case "bar": {
			const { xKey = "timestamp", yKey = "value", labelKey } = options;

			return {
				labels: data.map((item) => item[labelKey] || formatDate(item[xKey])),
				datasets: [
					{
						data: data.map((item) => item[yKey]),
					},
				],
			};
		}

		case "pie":
		case "doughnut": {
			const { labelKey = "label", valueKey = "value" } = options;

			return {
				labels: data.map((item) => item[labelKey]),
				datasets: [
					{
						data: data.map((item) => item[valueKey]),
					},
				],
			};
		}

		case "radar": {
			const { labelKey = "label", valueKey = "value" } = options;

			return {
				labels: data.map((item) => item[labelKey]),
				datasets: [
					{
						data: data.map((item) => item[valueKey]),
					},
				],
			};
		}

		default:
			return data;
	}
};

/**
 * 格式化表格数据
 * @param {Array} data - 原始数据
 * @param {Array<Object>} columns - 列定义
 * @returns {Array} 格式化后的表格数据
 */
export const formatTableData = (data, columns) => {
	if (!data || !Array.isArray(data)) return [];
	if (!columns || !Array.isArray(columns)) return data;

	return data.map((row) => {
		const formattedRow = {};

		columns.forEach((column) => {
			const { key, formatter } = column;

			if (key in row) {
				formattedRow[key] = formatter ? formatter(row[key], row) : row[key];
			} else {
				formattedRow[key] = undefined;
			}
		});

		return formattedRow;
	});
};

/**
 * 格式化 API 响应数据
 * @param {Object} response - API 响应对象
 * @param {Array<string>} [requiredFields=[]] - 必需的字段
 * @returns {Object|null} 格式化后的数据或 null（如果缺少必需字段）
 */
export const formatApiResponse = (response, requiredFields = []) => {
	if (!response) return null;

	// 检查必需字段
	const missingFields = requiredFields.filter((field) => !(field in response));

	if (missingFields.length > 0) {
		console.warn(`API 响应缺少必需字段: ${missingFields.join(", ")}`);
		return null;
	}

	return response;
};

export default {
	// 日期格式化
	formatDate,
	formatDateTime,
	formatTimeAgo,
	formatDuration,

	// 数字格式化
	formatNumber,
	formatCurrency,
	formatPercentage,
	formatFileSize,

	// 文本格式化
	truncateText,
	capitalizeText,
	formatSentiment,
	highlightKeywords,

	// 数据格式化
	formatTaskStatus,
	formatChartData,
	formatTableData,
	formatApiResponse,
};
