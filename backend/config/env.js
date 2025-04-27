/**
 * 环境变量配置
 * 负责加载和验证应用所需的环境变量
 */

import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "../utils/logger.js";

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 加载根目录中的.env文件
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

/**
 * 环境变量配置对象
 * 包含应用所需的所有环境变量，并提供默认值
 */
const config = {
	// 应用环境
	NODE_ENV: process.env.NODE_ENV || "development",

	// 服务器配置
	PORT: parseInt(process.env.PORT || "5000", 10),
	HOST: process.env.HOST || "localhost",

	// MongoDB配置
	MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/taskmanager",

	// JWT配置
	JWT_SECRET: process.env.JWT_SECRET,
	JWT_EXPIRE: process.env.JWT_EXPIRE || "30d",

	// DeepSeek AI API配置
	DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,
	DEEPSEEK_API_URL: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com",

	// 爬虫配置
	CRAWLER_MAX_CONCURRENCY: parseInt(
		process.env.CRAWLER_MAX_CONCURRENCY || "10",
		10
	),

	// 日志配置
	LOG_LEVEL:
		process.env.LOG_LEVEL ||
		(process.env.NODE_ENV === "production" ? "info" : "debug"),

	// CORS配置
	CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
};

/**
 * 验证必需的环境变量是否已设置
 */
const requiredEnvVars = ["JWT_SECRET", "DEEPSEEK_API_KEY"];
const missingEnvVars = requiredEnvVars.filter((envVar) => !config[envVar]);

if (missingEnvVars.length > 0) {
	const errorMessage = `缺少必需的环境变量: ${missingEnvVars.join(", ")}`;
	if (process.env.NODE_ENV === "production") {
		logger.error(errorMessage);
		throw new Error(errorMessage);
	} else {
		logger.warn(
			`${errorMessage}. 在开发环境中继续运行，但在生产环境中这将导致错误。`
		);
	}
}

// 输出当前环境配置（仅在开发环境）
if (config.NODE_ENV === "development") {
	logger.debug("当前环境配置:", {
		...config,
		// 隐藏敏感信息
		JWT_SECRET: config.JWT_SECRET ? "******" : undefined,
		DEEPSEEK_API_KEY: config.DEEPSEEK_API_KEY ? "******" : undefined,
	});
}

export default config;
