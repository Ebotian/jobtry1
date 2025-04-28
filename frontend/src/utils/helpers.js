/**
 * @fileoverview 辅助工具函数
 * 提供各种通用工具函数，用于简化常见操作
 */

/**
 * 存储相关辅助函数
 */

/**
 * 从本地存储获取数据，自动解析 JSON
 * @param {string} key - 存储键名
 * @param {*} [defaultValue=null] - 如果键不存在，返回的默认值
 * @returns {*} 存储的值或默认值
 */
export const getStorageItem = (key, defaultValue = null) => {
	try {
		const item = localStorage.getItem(key);
		if (item === null) return defaultValue;
		return JSON.parse(item);
	} catch (error) {
		console.error(`从存储中获取键 "${key}" 时出错:`, error);
		return defaultValue;
	}
};

/**
 * 将数据存储到本地存储，自动序列化对象
 * @param {string} key - 存储键名
 * @param {*} value - 要存储的值
 * @returns {boolean} 是否存储成功
 */
export const setStorageItem = (key, value) => {
	try {
		localStorage.setItem(key, JSON.stringify(value));
		return true;
	} catch (error) {
		console.error(`存储键 "${key}" 时出错:`, error);
		return false;
	}
};

/**
 * 从本地存储移除数据
 * @param {string} key - 存储键名
 * @returns {boolean} 是否移除成功
 */
export const removeStorageItem = (key) => {
	try {
		localStorage.removeItem(key);
		return true;
	} catch (error) {
		console.error(`移除键 "${key}" 时出错:`, error);
		return false;
	}
};

/**
 * 验证相关辅助函数
 */

/**
 * 检查字符串是否为有效的电子邮件格式
 * @param {string} email - 要验证的电子邮件字符串
 * @returns {boolean} 是否为有效的电子邮件格式
 */
export const isValidEmail = (email) => {
	if (!email) return false;
	// 使用正则表达式验证电子邮件格式
	const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
	return emailRegex.test(email);
};

/**
 * 检查密码是否足够强壮
 * @param {string} password - 要验证的密码
 * @param {Object} [options] - 自定义验证选项
 * @param {number} [options.minLength=8] - 最小长度
 * @param {boolean} [options.requireUppercase=true] - 是否需要大写字母
 * @param {boolean} [options.requireLowercase=true] - 是否需要小写字母
 * @param {boolean} [options.requireNumbers=true] - 是否需要数字
 * @param {boolean} [options.requireSpecial=true] - 是否需要特殊字符
 * @returns {boolean} 密码是否强壮
 */
export const isStrongPassword = (password, options = {}) => {
	if (!password) return false;

	const {
		minLength = 8,
		requireUppercase = true,
		requireLowercase = true,
		requireNumbers = true,
		requireSpecial = true,
	} = options;

	// 检查密码长度
	if (password.length < minLength) return false;

	// 检查大写字母
	if (requireUppercase && !/[A-Z]/.test(password)) return false;

	// 检查小写字母
	if (requireLowercase && !/[a-z]/.test(password)) return false;

	// 检查数字
	if (requireNumbers && !/[0-9]/.test(password)) return false;

	// 检查特殊字符
	if (requireSpecial && !/[^A-Za-z0-9]/.test(password)) return false;

	return true;
};

/**
 * 检查字符串是否非空
 * @param {string} value - 要检查的字符串
 * @returns {boolean} 字符串是否非空
 */
export const isNotEmpty = (value) => {
	return typeof value === "string" && value.trim() !== "";
};

/**
 * 检查值是否匹配指定的正则表达式模式
 * @param {string} value - 要检查的值
 * @param {RegExp|string} pattern - 正则表达式或模式字符串
 * @returns {boolean} 是否匹配模式
 */
export const matchesPattern = (value, pattern) => {
	if (!value || !pattern) return false;

	const regex = pattern instanceof RegExp ? pattern : new RegExp(pattern);
	return regex.test(value);
};

/**
 * URL 相关辅助函数
 */

/**
 * 构建查询字符串
 * @param {Object} params - 参数对象
 * @returns {string} 格式化的查询字符串，以 ? 开头
 */
export const buildQueryString = (params) => {
	if (
		!params ||
		typeof params !== "object" ||
		Object.keys(params).length === 0
	) {
		return "";
	}

	const queryParams = new URLSearchParams();

	Object.entries(params).forEach(([key, value]) => {
		if (value !== undefined && value !== null) {
			queryParams.append(key, value.toString());
		}
	});

	const queryString = queryParams.toString();
	return queryString ? `?${queryString}` : "";
};

/**
 * 解析 URL 查询字符串为对象
 * @param {string} [queryString] - 要解析的查询字符串，默认使用当前 URL
 * @returns {Object} 解析后的参数对象
 */
export const parseQueryString = (queryString) => {
	// 如果未提供查询字符串，使用当前 URL 的查询字符串
	const searchParams = new URLSearchParams(
		queryString !== undefined ? queryString : window.location.search
	);

	const params = {};

	for (const [key, value] of searchParams.entries()) {
		// 尝试将数字字符串转换为数字
		const numValue = Number(value);
		params[key] = !isNaN(numValue) && value !== "" ? numValue : value;
	}

	return params;
};

/**
 * 从当前 URL 中获取路由参数
 * @param {string} paramName - 参数名称
 * @returns {string|null} 参数值或 null
 */
export const getRouteParam = (paramName) => {
	// 这个函数假设使用 React Router 或类似的路由系统
	// 对于不同的路由库，可能需要调整实现
	try {
		const urlPattern = new URLPattern(window.location.href);
		return urlPattern.search.get(paramName);
	} catch (error) {
		console.warn(`获取路由参数 "${paramName}" 时出错:`, error);
		return null;
	}
};

/**
 * 通用辅助函数
 */

/**
 * 防抖函数：限制函数在一段时间内只执行一次
 * @param {Function} func - 要防抖的函数
 * @param {number} [wait=300] - 等待时间（毫秒）
 * @returns {Function} 防抖后的函数
 */
export const debounce = (func, wait = 300) => {
	let timeout;

	return function executedFunction(...args) {
		const later = () => {
			clearTimeout(timeout);
			func(...args);
		};

		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
	};
};

/**
 * 节流函数：限制函数在一段时间内最多执行一次
 * @param {Function} func - 要节流的函数
 * @param {number} [limit=300] - 时间限制（毫秒）
 * @returns {Function} 节流后的函数
 */
export const throttle = (func, limit = 300) => {
	let inThrottle;

	return function executedFunction(...args) {
		if (!inThrottle) {
			func(...args);
			inThrottle = true;
			setTimeout(() => {
				inThrottle = false;
			}, limit);
		}
	};
};

/**
 * 生成随机 ID
 * @param {number} [length=8] - ID 长度
 * @param {string} [prefix=''] - ID 前缀
 * @returns {string} 随机 ID
 */
export const generateId = (length = 8, prefix = "") => {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = prefix;

	for (let i = 0; i < length; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}

	return result;
};

/**
 * 深度合并对象
 * @param {...Object} objects - 要合并的对象
 * @returns {Object} 合并后的新对象
 */
export const deepMerge = (...objects) => {
	const isObject = (obj) =>
		obj && typeof obj === "object" && !Array.isArray(obj);

	return objects.reduce((prev, obj) => {
		if (!obj) return prev;

		Object.keys(obj).forEach((key) => {
			const pVal = prev[key];
			const oVal = obj[key];

			if (isObject(pVal) && isObject(oVal)) {
				prev[key] = deepMerge(pVal, oVal);
			} else {
				prev[key] = oVal !== undefined ? oVal : pVal;
			}
		});

		return prev;
	}, {});
};

/**
 * 从对象中选择指定的属性
 * @param {Object} obj - 源对象
 * @param {Array<string>} keys - 要选择的属性名数组
 * @returns {Object} 包含选中属性的新对象
 */
export const pick = (obj, keys) => {
	if (!obj || typeof obj !== "object") return {};

	return keys.reduce((result, key) => {
		if (key in obj) {
			result[key] = obj[key];
		}
		return result;
	}, {});
};

/**
 * 从对象中排除指定的属性
 * @param {Object} obj - 源对象
 * @param {Array<string>} keys - 要排除的属性名数组
 * @returns {Object} 排除指定属性后的新对象
 */
export const omit = (obj, keys) => {
	if (!obj || typeof obj !== "object") return {};

	return Object.entries(obj)
		.filter(([key]) => !keys.includes(key))
		.reduce((result, [key, value]) => {
			result[key] = value;
			return result;
		}, {});
};

/**
 * API 相关辅助函数
 */

/**
 * 处理 API 错误响应
 * @param {Error} error - 错误对象
 * @param {Function} [callback] - 可选的回调函数
 * @returns {Object} 格式化的错误对象
 */
export const handleApiError = (error, callback) => {
	// 默认错误信息
	const defaultError = {
		message: "发生了未知错误，请稍后再试",
		code: "SERVER_ERROR",
		status: 500,
	};

	// 提取错误信息
	const errorInfo =
		error.data?.error || error.response?.data?.error || defaultError;

	// 如果提供了回调，则执行
	if (typeof callback === "function") {
		callback(errorInfo);
	}

	// 记录错误
	console.error("API 错误:", errorInfo.message, error);

	return errorInfo;
};

/**
 * 构建包含授权信息的请求头
 * @param {Object} [customHeaders={}] - 自定义请求头
 * @returns {Object} 包含授权信息的请求头对象
 */
export const buildHeaders = (customHeaders = {}) => {
	const token = getStorageItem("authToken");

	const headers = {
		"Content-Type": "application/json",
		Accept: "application/json",
		...customHeaders,
	};

	if (token) {
		headers["Authorization"] = `Bearer ${token}`;
	}

	return headers;
};

/**
 * 从 API 响应中提取分页信息
 * @param {Object} response - API 响应对象
 * @returns {Object|null} 分页信息或 null
 */
export const extractPaginationInfo = (response) => {
	if (!response) return null;

	const {
		totalItems,
		totalPages,
		currentPage,
		pageSize,
		hasNextPage,
		hasPreviousPage,
	} = response;

	// 至少需要 totalItems 和 currentPage 才能构建分页信息
	if (totalItems === undefined || currentPage === undefined) {
		return null;
	}

	return {
		totalItems,
		totalPages: totalPages || Math.ceil(totalItems / (pageSize || 10)),
		currentPage,
		pageSize: pageSize || 10,
		hasNextPage:
			hasNextPage !== undefined
				? hasNextPage
				: currentPage <
				  (totalPages || Math.ceil(totalItems / (pageSize || 10))),
		hasPreviousPage:
			hasPreviousPage !== undefined ? hasPreviousPage : currentPage > 1,
	};
};

/**
 * 格式化 API 请求数据
 * @param {Object} data - 请求数据
 * @param {Array<string>} [requiredFields=[]] - 必需的字段
 * @returns {Object} 格式化后的请求数据
 * @throws {Error} 如果缺少必需字段则抛出错误
 */
export const formatRequestData = (data, requiredFields = []) => {
	if (!data) {
		throw new Error("请求数据不能为空");
	}

	// 检查必需字段
	const missingFields = requiredFields.filter((field) => !(field in data));

	if (missingFields.length > 0) {
		throw new Error(`缺少必需的字段: ${missingFields.join(", ")}`);
	}

	return data;
};

/**
 * 格式化 API 响应数据
 * @param {Object} response - API 响应对象
 * @param {function} [formatter] - 可选的响应格式化函数
 * @returns {Object} 格式化后的响应数据
 */
export const formatResponseData = (response, formatter) => {
	if (!response) return null;

	if (typeof formatter === "function") {
		return formatter(response);
	}

	return response;
};

export default {
	// 存储辅助函数
	getStorageItem,
	setStorageItem,
	removeStorageItem,

	// 验证辅助函数
	isValidEmail,
	isStrongPassword,
	isNotEmpty,
	matchesPattern,

	// URL 辅助函数
	buildQueryString,
	parseQueryString,
	getRouteParam,

	// 通用辅助函数
	debounce,
	throttle,
	generateId,
	deepMerge,
	pick,
	omit,

	// API 辅助函数
	handleApiError,
	buildHeaders,
	extractPaginationInfo,
	formatRequestData,
	formatResponseData,
};
