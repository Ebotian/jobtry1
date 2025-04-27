/**
 * 日志工具模块
 * 基于Winston日志库实现，提供多级别、多目标的日志功能
 */

import winston from "winston";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 创建日志目录
const logDir = path.join(__dirname, "../../logs");
if (!fs.existsSync(logDir)) {
	fs.mkdirSync(logDir, { recursive: true });
}

// 自定义日志格式
const customFormat = winston.format.combine(
	winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
	winston.format.errors({ stack: true }),
	winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
		const metaStr = Object.keys(meta).length
			? `\n${JSON.stringify(meta, null, 2)}`
			: "";
		const stackStr = stack ? `\n${stack}` : "";
		return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}${stackStr}`;
	})
);

// 控制台日志格式（带颜色）
const consoleFormat = winston.format.combine(
	winston.format.colorize(),
	customFormat
);

// 日志级别
const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
};

// 根据环境确定日志级别
const level = () => {
	const env = process.env.NODE_ENV || "development";
	const isDevelopment = env === "development";
	return isDevelopment ? "debug" : "info";
};

// 日志级别对应颜色
const colors = {
	error: "red",
	warn: "yellow",
	info: "green",
	http: "magenta",
	debug: "blue",
};

// 添加颜色
winston.addColors(colors);

// 定义传输目标
const transports = [
	// 控制台输出
	new winston.transports.Console({
		format: consoleFormat,
		handleExceptions: true,
	}),
	// 所有日志记录到combined.log
	new winston.transports.File({
		filename: path.join(logDir, "combined.log"),
		format: customFormat,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
	}),
	// 错误日志记录到error.log
	new winston.transports.File({
		filename: path.join(logDir, "error.log"),
		level: "error",
		format: customFormat,
		maxsize: 5242880, // 5MB
		maxFiles: 5,
	}),
];

// 创建logger实例
export const logger = winston.createLogger({
	level: level(),
	levels,
	format: customFormat,
	transports,
	exitOnError: false,
	// 处理未捕获的异常
	exceptionHandlers: [
		new winston.transports.File({
			filename: path.join(logDir, "exceptions.log"),
			format: customFormat,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
	],
	// 处理未处理的Promise拒绝
	rejectionHandlers: [
		new winston.transports.File({
			filename: path.join(logDir, "rejections.log"),
			format: customFormat,
			maxsize: 5242880, // 5MB
			maxFiles: 5,
		}),
	],
});

/**
 * 自定义日志方法，支持上下文信息
 * @param {string} level - 日志级别
 * @param {string} message - 日志消息
 * @param {Object} context - 上下文信息（可选）
 */
export const log = (level, message, context = {}) => {
	if (!["error", "warn", "info", "http", "debug"].includes(level)) {
		level = "info";
	}

	logger[level](message, context);
};

// 创建HTTP请求日志中间件
export const httpLogger = (req, res, next) => {
	const start = Date.now();

	res.on("finish", () => {
		const duration = Date.now() - start;
		logger.http(`${req.method} ${req.originalUrl}`, {
			method: req.method,
			url: req.originalUrl,
			ip: req.ip,
			statusCode: res.statusCode,
			duration: `${duration}ms`,
			userAgent: req.get("user-agent") || "",
		});
	});

	next();
};

export default {
	logger,
	log,
	httpLogger,
};
