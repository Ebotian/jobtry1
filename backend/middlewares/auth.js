/**
 * 身份验证中间件
 * 负责处理用户身份验证和授权
 */

import jwt from "jsonwebtoken";
import { promisify } from "util";
import User from "../models/User.js";
import config from "../config/env.js";
import { responseUtils } from "../utils/helpers.js";
import { logger } from "../utils/logger.js";

/**
 * 保护路由中间件 - 验证用户是否已登录
 * 解析JWT令牌并验证用户
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export const protect = async (req, res, next) => {
	try {
		let token;

		// 从请求头或cookie中获取令牌
		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			// 从Bearer令牌中提取
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.token) {
			// 从cookie中提取
			token = req.cookies.token;
		}

		// 检查令牌是否存在
		if (!token) {
			return res.status(401).json(responseUtils.error("未授权，请登录", 401));
		}

		try {
			// 验证令牌
			const decoded = await promisify(jwt.verify)(token, config.JWT_SECRET);

			// 检查用户是否存在
			const user = await User.findById(decoded.id).select("-password");

			if (!user) {
				return res.status(401).json(responseUtils.error("该用户不再存在", 401));
			}

			// 检查令牌是否在用户更改密码后颁发
			if (
				user.passwordChangedAt &&
				decoded.iat < user.passwordChangedAt.getTime() / 1000
			) {
				return res
					.status(401)
					.json(responseUtils.error("用户近期更改了密码，请重新登录", 401));
			}

			// 将用户信息添加到请求对象
			req.user = user;
			next();
		} catch (error) {
			logger.error("验证JWT时出错:", error);
			return res.status(401).json(responseUtils.error("未授权，令牌无效", 401));
		}
	} catch (error) {
		logger.error("保护路由中间件出错:", error);
		return res.status(500).json(responseUtils.error("服务器内部错误", 500));
	}
};

/**
 * 角色授权中间件 - 限制对路由的访问
 * @param  {...string} roles - 允许访问的角色列表
 * @returns {Function} Express中间件
 */
export const authorize = (...roles) => {
	return (req, res, next) => {
		// 检查用户角色是否在允许列表中
		if (!req.user || !roles.includes(req.user.role)) {
			return res.status(403).json(responseUtils.error("您无权执行此操作", 403));
		}

		next();
	};
};

/**
 * 可选保护中间件 - 如果有令牌则验证，没有则跳过
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export const optionalProtect = async (req, res, next) => {
	try {
		let token;

		if (
			req.headers.authorization &&
			req.headers.authorization.startsWith("Bearer")
		) {
			token = req.headers.authorization.split(" ")[1];
		} else if (req.cookies && req.cookies.token) {
			token = req.cookies.token;
		}

		// 如果没有令牌，继续处理请求
		if (!token) {
			return next();
		}

		try {
			// 验证令牌
			const decoded = await promisify(jwt.verify)(token, config.JWT_SECRET);
			const user = await User.findById(decoded.id).select("-password");

			// 将用户信息添加到请求对象（如果找到）
			if (user) {
				req.user = user;
			}

			next();
		} catch (error) {
			// 令牌无效，但这是可选的保护，所以继续处理请求
			next();
		}
	} catch (error) {
		logger.error("可选保护中间件出错:", error);
		next();
	}
};

/**
 * 生成JWT令牌
 * @param {string} userId - 用户ID
 * @returns {string} JWT令牌
 */
export const generateToken = (userId) => {
	return jwt.sign({ id: userId }, config.JWT_SECRET, {
		expiresIn: config.JWT_EXPIRE,
	});
};

/**
 * 将JWT令牌发送到客户端并在cookie中保存
 * @param {Object} user - 用户对象
 * @param {number} statusCode - HTTP状态码
 * @param {Object} res - Express响应对象
 */
export const sendTokenResponse = (user, statusCode, res) => {
	// 生成令牌
	const token = generateToken(user._id);

	const options = {
		expires: new Date(
			Date.now() +
				parseInt(config.JWT_EXPIRE.replace(/[^\d]/g, "")) * 24 * 60 * 60 * 1000
		),
		httpOnly: true, // 只能通过HTTP访问，不能通过JS访问
		secure: config.NODE_ENV === "production", // 在生产环境中使用HTTPS
	};

	// 发送响应
	res
		.status(statusCode)
		.cookie("token", token, options)
		.json(
			responseUtils.success({
				token,
				user: {
					id: user._id,
					name: user.name,
					email: user.email,
					role: user.role,
				},
			})
		);
};

export default {
	protect,
	authorize,
	optionalProtect,
	generateToken,
	sendTokenResponse,
};
