/**
 * @fileoverview 常用表单和业务校验函数
 * 提供与后端 API 一致的输入校验，全部 ES6 标准，中文注释
 */

/**
 * 校验邮箱格式
 * @param {string} email - 邮箱字符串
 * @returns {boolean}
 */
export const isEmail = (email) => {
	if (!email) return false;
	// 简单邮箱正则
	return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

/**
 * 校验密码强度（最少8位，含字母和数字）
 * @param {string} password
 * @returns {boolean}
 */
export const isPasswordStrong = (password) => {
	if (!password) return false;
	return /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+\-=]{8,}$/.test(password);
};

/**
 * 校验字符串非空
 * @param {string} value
 * @returns {boolean}
 */
export const isNotEmpty = (value) => {
	return typeof value === "string" && value.trim() !== "";
};

/**
 * 校验两个值是否相等
 * @param {any} a
 * @param {any} b
 * @returns {boolean}
 */
export const isMatch = (a, b) => a === b;

/**
 * 校验用户名（3-20位，字母数字下划线）
 * @param {string} username
 * @returns {boolean}
 */
export const isValidUsername = (username) => {
	if (!username) return false;
	return /^[a-zA-Z0-9_]{3,20}$/.test(username);
};

/**
 * 校验任务关键词（非空，长度1-50）
 * @param {string} keywords
 * @returns {boolean}
 */
export const isValidKeywords = (keywords) => {
	return (
		typeof keywords === "string" &&
		keywords.trim().length > 0 &&
		keywords.length <= 50
	);
};

/**
 * 校验任务 interval（正整数，1-1440分钟）
 * @param {number} interval
 * @returns {boolean}
 */
export const isValidInterval = (interval) => {
	return Number.isInteger(interval) && interval >= 1 && interval <= 1440;
};

/**
 * 校验重置密码 token（非空字符串）
 * @param {string} token
 * @returns {boolean}
 */
export const isValidResetToken = (token) => {
	return typeof token === "string" && token.trim().length > 0;
};

/**
 * 校验注册表单
 * @param {Object} data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateRegister = (data) => {
	const errors = {};
	if (!isValidUsername(data.username)) errors.username = "用户名格式不正确";
	if (!isEmail(data.email)) errors.email = "邮箱格式不正确";
	if (!isPasswordStrong(data.password))
		errors.password = "密码强度不足（至少8位，含字母和数字）";
	if (!isMatch(data.password, data.confirmPassword))
		errors.confirmPassword = "两次密码输入不一致";
	return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * 校验登录表单
 * @param {Object} data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateLogin = (data) => {
	const errors = {};
	if (!isEmail(data.email)) errors.email = "邮箱格式不正确";
	if (!isNotEmpty(data.password)) errors.password = "密码不能为空";
	return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * 校验任务创建表单
 * @param {Object} data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateTask = (data) => {
	const errors = {};
	if (!isValidKeywords(data.keywords))
		errors.keywords = "关键词不能为空且不超过50字";
	if (!isValidInterval(data.interval))
		errors.interval = "监控频率需为1-1440分钟的整数";
	// source 可选
	return { valid: Object.keys(errors).length === 0, errors };
};

/**
 * 校验重置密码表单
 * @param {Object} data
 * @returns {Object} { valid: boolean, errors: Object }
 */
export const validateResetPassword = (data) => {
	const errors = {};
	if (!isValidResetToken(data.token)) errors.token = "重置令牌无效";
	if (!isPasswordStrong(data.password)) errors.password = "密码强度不足";
	if (!isMatch(data.password, data.confirmPassword))
		errors.confirmPassword = "两次密码输入不一致";
	return { valid: Object.keys(errors).length === 0, errors };
};
