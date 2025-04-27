/**
 * 全局错误处理中间件
 * 负责捕获和格式化应用程序中的各种错误
 */

import { logger } from "../utils/logger.js";
import config from "../config/env.js";
import mongoose from "mongoose";

/**
 * 自定义API错误类
 * 用于创建带有状态码和错误消息的自定义错误
 */
export class AppError extends Error {
	/**
	 * 创建自定义API错误
	 * @param {string} message - 错误消息
	 * @param {number} statusCode - HTTP状态码
	 */
	constructor(message, statusCode) {
		super(message);
		this.statusCode = statusCode;
		this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
		this.isOperational = true; // 标记为操作错误，便于区分

		Error.captureStackTrace(this, this.constructor);
	}
}

/**
 * 处理Mongoose验证错误
 * @param {Error} err - Mongoose验证错误
 * @returns {Object} 格式化后的错误对象
 */
const handleValidationError = (err) => {
	const errors = Object.values(err.errors).map((val) => val.message);
	const message = `验证失败: ${errors.join("; ")}`;
	return new AppError(message, 400);
};

/**
 * 处理Mongoose重复键错误
 * @param {Error} err - Mongoose重复键错误
 * @returns {Object} 格式化后的错误对象
 */
const handleDuplicateFieldsError = (err) => {
	// 从错误消息中提取重复值（通常在引号内）
	const value = err.message.match(/(["'])(\\?.)*?\1/)[0];
	const message = `重复的字段值: ${value}，请使用另一个值`;
	return new AppError(message, 400);
};

/**
 * 处理MongoDB ID转换错误
 * @returns {Object} 格式化后的错误对象
 */
const handleCastError = () => {
	return new AppError("无效的ID格式", 400);
};

/**
 * 处理JWT错误
 * @returns {Object} 格式化后的错误对象
 */
const handleJWTError = () => {
	return new AppError("无效的认证令牌，请重新登录", 401);
};

/**
 * 处理JWT过期错误
 * @returns {Object} 格式化后的错误对象
 */
const handleJWTExpiredError = () => {
	return new AppError("认证令牌已过期，请重新登录", 401);
};

/**
 * 开发环境错误处理 - 返回详细错误信息
 * @param {Object} err - 错误对象
 * @param {Object} res - Express响应对象
 */
const sendErrorDev = (err, res) => {
	// 记录详细错误日志
	logger.error("开发环境错误:", {
		message: err.message,
		stack: err.stack,
		statusCode: err.statusCode,
	});

	res.status(err.statusCode).json({
		status: err.status,
		error: err,
		message: err.message,
		stack: err.stack,
		timestamp: new Date().toISOString(),
	});
};

/**
 * 生产环境错误处理 - 返回有限的错误信息
 * @param {Object} err - 错误对象
 * @param {Object} res - Express响应对象
 */
const sendErrorProd = (err, res) => {
	// 操作性错误：发送给客户端
	if (err.isOperational) {
		// 记录错误日志
		logger.warn("操作性错误:", {
			message: err.message,
			statusCode: err.statusCode,
		});

		res.status(err.statusCode).json({
			status: err.status,
			message: err.message,
			timestamp: new Date().toISOString(),
		});
	}
	// 编程或未知错误：不要泄露错误详情
	else {
		// 记录错误日志
		logger.error("非操作性错误:", {
			message: err.message,
			stack: err.stack,
		});

		res.status(500).json({
			status: "error",
			message: "出现了一些问题",
			timestamp: new Date().toISOString(),
		});
	}
};

/**
 * 全局错误处理中间件
 * @param {Object} err - 错误对象
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export const errorHandler = (err, req, res, next) => {
	// 默认状态码和状态
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";

	// 克隆错误对象以便于处理
	let error = { ...err };
	error.message = err.message;
	error.stack = err.stack;
	error.name = err.name;

	// 处理特定类型的错误
	if (error.name === "ValidationError") {
		error = handleValidationError(err);
	}

	if (error.name === "CastError") {
		error = handleCastError();
	}

	if (error.code === 11000) {
		error = handleDuplicateFieldsError(err);
	}

	if (error.name === "JsonWebTokenError") {
		error = handleJWTError();
	}

	if (error.name === "TokenExpiredError") {
		error = handleJWTExpiredError();
	}

	// 根据环境发送响应
	if (config.NODE_ENV === "development") {
		sendErrorDev(error, res);
	} else {
		sendErrorProd(error, res);
	}
};

/**
 * 捕获异步错误的高阶函数
 * 包装异步路由处理程序，自动将错误传递给下一个中间件
 * @param {Function} fn - 异步路由处理函数
 * @returns {Function} 包装后的路由处理函数
 */
export const catchAsync = (fn) => {
	return (req, res, next) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};
};

/**
 * 创建404错误的中间件
 * 用于处理未找到的路由
 * @param {Object} req - Express请求对象
 * @param {Object} res - Express响应对象
 * @param {Function} next - Express下一个中间件函数
 */
export const notFound = (req, res, next) => {
	next(new AppError(`找不到路径: ${req.originalUrl}`, 404));
};

export default {
	AppError,
	errorHandler,
	catchAsync,
	notFound,
};
