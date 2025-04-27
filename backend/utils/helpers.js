/**
 * 辅助工具模块
 * 提供项目中常用的通用工具函数
 */

import crypto from "crypto";
import { logger } from "./logger.js";

/**
 * 字符串处理相关工具
 */
export const stringUtils = {
	/**
	 * 生成指定长度的随机字符串
	 * @param {number} length - 字符串长度，默认为 16
	 * @param {string} charset - 字符集，默认为字母数字
	 * @returns {string} 随机字符串
	 */
	generateRandomString: (
		length = 16,
		charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
	) => {
		let result = "";
		const charsetLength = charset.length;

		// 使用加密安全的随机数生成器
		const randomValues = new Uint8Array(length);
		crypto.randomFillSync(randomValues);

		for (let i = 0; i < length; i++) {
			result += charset.charAt(randomValues[i] % charsetLength);
		}

		return result;
	},

	/**
	 * 截断文本到指定长度，并在末尾添加省略号
	 * @param {string} text - 原始文本
	 * @param {number} maxLength - 最大长度
	 * @returns {string} 截断后的文本
	 */
	truncateText: (text, maxLength = 100) => {
		if (!text || text.length <= maxLength) return text;
		return `${text.substring(0, maxLength)}...`;
	},

	/**
	 * 将字符串的首字母大写
	 * @param {string} str - 输入字符串
	 * @returns {string} 首字母大写的字符串
	 */
	capitalize: (str) => {
		if (!str || typeof str !== "string") return "";
		return str.charAt(0).toUpperCase() + str.slice(1);
	},
};

/**
 * 日期时间处理相关工具
 */
export const dateUtils = {
	/**
	 * 格式化日期为指定格式
	 * @param {Date|string|number} date - 日期对象、时间戳或日期字符串
	 * @param {string} format - 格式字符串，默认为 'YYYY-MM-DD HH:mm:ss'
	 * @returns {string} 格式化后的日期字符串
	 */
	formatDate: (date, format = "YYYY-MM-DD HH:mm:ss") => {
		const d = new Date(date);

		if (isNaN(d.getTime())) {
			return "Invalid Date";
		}

		const year = d.getFullYear();
		const month = String(d.getMonth() + 1).padStart(2, "0");
		const day = String(d.getDate()).padStart(2, "0");
		const hours = String(d.getHours()).padStart(2, "0");
		const minutes = String(d.getMinutes()).padStart(2, "0");
		const seconds = String(d.getSeconds()).padStart(2, "0");

		return format
			.replace("YYYY", year)
			.replace("MM", month)
			.replace("DD", day)
			.replace("HH", hours)
			.replace("mm", minutes)
			.replace("ss", seconds);
	},

	/**
	 * 计算两个日期之间的时间差（以指定单位返回）
	 * @param {Date|string|number} startDate - 开始日期
	 * @param {Date|string|number} endDate - 结束日期
	 * @param {string} unit - 时间单位，可选：'milliseconds', 'seconds', 'minutes', 'hours', 'days'
	 * @returns {number} 时间差
	 */
	getTimeDifference: (startDate, endDate, unit = "milliseconds") => {
		const start = new Date(startDate);
		const end = new Date(endDate);

		if (isNaN(start.getTime()) || isNaN(end.getTime())) {
			return NaN;
		}

		const diffMs = end.getTime() - start.getTime();

		switch (unit.toLowerCase()) {
			case "seconds":
				return Math.floor(diffMs / 1000);
			case "minutes":
				return Math.floor(diffMs / (1000 * 60));
			case "hours":
				return Math.floor(diffMs / (1000 * 60 * 60));
			case "days":
				return Math.floor(diffMs / (1000 * 60 * 60 * 24));
			default:
				return diffMs; // 默认返回毫秒
		}
	},

	/**
	 * 获取相对于当前日期的日期
	 * @param {number} value - 数值
	 * @param {string} unit - 时间单位，可选：'days', 'months', 'years'
	 * @returns {Date} 相对日期
	 */
	getRelativeDate: (value, unit = "days") => {
		const now = new Date();

		switch (unit.toLowerCase()) {
			case "days":
				return new Date(now.setDate(now.getDate() + value));
			case "months":
				return new Date(now.setMonth(now.getMonth() + value));
			case "years":
				return new Date(now.setFullYear(now.getFullYear() + value));
			default:
				return now;
		}
	},
};

/**
 * 对象处理相关工具
 */
export const objectUtils = {
	/**
	 * 从对象中选择指定字段
	 * @param {Object} obj - 源对象
	 * @param {Array<string>} fields - 要选择的字段数组
	 * @returns {Object} 包含指定字段的新对象
	 */
	pick: (obj, fields) => {
		if (!obj || typeof obj !== "object") return {};

		return fields.reduce((result, field) => {
			if (Object.prototype.hasOwnProperty.call(obj, field)) {
				result[field] = obj[field];
			}
			return result;
		}, {});
	},

	/**
	 * 从对象中排除指定字段
	 * @param {Object} obj - 源对象
	 * @param {Array<string>} fields - 要排除的字段数组
	 * @returns {Object} 不包含指定字段的新对象
	 */
	omit: (obj, fields) => {
		if (!obj || typeof obj !== "object") return {};

		return Object.keys(obj)
			.filter((key) => !fields.includes(key))
			.reduce((result, key) => {
				result[key] = obj[key];
				return result;
			}, {});
	},

	/**
	 * 深度合并多个对象
	 * @param {Object} target - 目标对象
	 * @param {...Object} sources - 源对象
	 * @returns {Object} 合并后的对象
	 */
	deepMerge: (target, ...sources) => {
		if (!sources.length) return target;

		const source = sources.shift();

		if (
			target &&
			source &&
			typeof target === "object" &&
			typeof source === "object"
		) {
			Object.keys(source).forEach((key) => {
				if (source[key] instanceof Object && !Array.isArray(source[key])) {
					if (!target[key]) Object.assign(target, { [key]: {} });
					objectUtils.deepMerge(target[key], source[key]);
				} else {
					Object.assign(target, { [key]: source[key] });
				}
			});
		}

		return objectUtils.deepMerge(target, ...sources);
	},
};

/**
 * HTTP响应处理相关工具
 */
export const responseUtils = {
	/**
	 * 创建成功响应对象
	 * @param {*} data - 响应数据
	 * @param {string} message - 成功消息
	 * @param {number} statusCode - HTTP状态码，默认为 200
	 * @returns {Object} 统一格式的响应对象
	 */
	success: (data = null, message = "操作成功", statusCode = 200) => ({
		success: true,
		statusCode,
		message,
		data,
		timestamp: Date.now(),
	}),

	/**
	 * 创建错误响应对象
	 * @param {string} message - 错误消息
	 * @param {number} statusCode - HTTP状态码，默认为 400
	 * @param {*} errors - 错误详情
	 * @returns {Object} 统一格式的响应对象
	 */
	error: (message = "操作失败", statusCode = 400, errors = null) => {
		// 记录错误日志
		logger.error(message, { statusCode, errors });

		return {
			success: false,
			statusCode,
			message,
			errors,
			timestamp: Date.now(),
		};
	},

	/**
	 * 创建分页响应对象
	 * @param {Array} data - 数据列表
	 * @param {number} total - 总记录数
	 * @param {number} page - 当前页码
	 * @param {number} limit - 每页记录数
	 * @param {string} message - 成功消息
	 * @returns {Object} 统一格式的分页响应对象
	 */
	paginated: (data, total, page, limit, message = "操作成功") => ({
		success: true,
		statusCode: 200,
		message,
		data,
		pagination: {
			total,
			page,
			limit,
			pages: Math.ceil(total / limit),
		},
		timestamp: Date.now(),
	}),
};

/**
 * 安全相关工具
 */
export const securityUtils = {
	/**
	 * 生成加密哈希值
	 * @param {string} data - 待哈希的数据
	 * @param {string} algorithm - 哈希算法，默认为 'sha256'
	 * @returns {string} 哈希字符串
	 */
	hashData: (data, algorithm = "sha256") => {
		return crypto.createHash(algorithm).update(data).digest("hex");
	},

	/**
	 * 生成指定长度的安全随机令牌
	 * @param {number} bytes - 字节数，默认为 32
	 * @returns {string} 十六进制格式的令牌
	 */
	generateToken: (bytes = 32) => {
		return crypto.randomBytes(bytes).toString("hex");
	},

	/**
	 * 对敏感数据进行脱敏处理
	 * @param {string} data - 原始数据
	 * @param {number} visibleStartChars - 开头可见字符数，默认为 4
	 * @param {number} visibleEndChars - 结尾可见字符数，默认为 4
	 * @param {string} mask - 掩码字符，默认为 '*'
	 * @returns {string} 脱敏后的数据
	 */
	maskSensitiveData: (
		data,
		visibleStartChars = 4,
		visibleEndChars = 4,
		mask = "*"
	) => {
		if (!data) return "";

		const strData = String(data);
		const dataLength = strData.length;

		if (dataLength <= visibleStartChars + visibleEndChars) {
			return strData;
		}

		const maskLength = dataLength - visibleStartChars - visibleEndChars;
		const maskedPart = mask.repeat(maskLength);

		return (
			strData.substring(0, visibleStartChars) +
			maskedPart +
			strData.substring(dataLength - visibleEndChars)
		);
	},
};

/**
 * 验证相关工具
 */
export const validationUtils = {
	/**
	 * 检查字符串是否有效电子邮件格式
	 * @param {string} email - 电子邮件地址
	 * @returns {boolean} 是否有效
	 */
	isValidEmail: (email) => {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(String(email).toLowerCase());
	},

	/**
	 * 检查字符串是否有效URL格式
	 * @param {string} url - URL字符串
	 * @returns {boolean} 是否有效
	 */
	isValidUrl: (url) => {
		try {
			new URL(url);
			return true;
		} catch (error) {
			return false;
		}
	},

	/**
	 * 检查字符串是否符合指定的最小/最大长度
	 * @param {string} str - 输入字符串
	 * @param {number} minLength - 最小长度
	 * @param {number} maxLength - 最大长度
	 * @returns {boolean} 是否有效
	 */
	isValidLength: (str, minLength = 0, maxLength = Infinity) => {
		if (str === null || str === undefined) return false;
		const length = String(str).length;
		return length >= minLength && length <= maxLength;
	},
};

export default {
	stringUtils,
	dateUtils,
	objectUtils,
	responseUtils,
	securityUtils,
	validationUtils,
};
