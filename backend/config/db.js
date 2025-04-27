/**
 * 数据库连接配置
 * 负责与MongoDB数据库建立连接
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import { logger } from "../utils/logger.js";

// 加载环境变量
dotenv.config();

// 数据库URI，优先使用环境变量，否则使用默认值
const MONGO_URI =
	process.env.MONGO_URI || "mongodb://localhost:27017/taskmanager";

// 数据库连接选项
const options = {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	autoIndex: true,
	serverSelectionTimeoutMS: 5000, // 超时设置：5秒
	socketTimeoutMS: 45000, // 套接字超时
	family: 4, // 强制使用IPv4
};

/**
 * 连接到MongoDB数据库
 * @returns {Promise} 连接成功的Promise
 */
export const connectDB = async () => {
	try {
		const conn = await mongoose.connect(MONGO_URI, options);

		logger.info(`MongoDB 连接成功: ${conn.connection.host}`);

		// 监听连接错误事件
		mongoose.connection.on("error", (err) => {
			logger.error(`MongoDB 连接错误: ${err.message}`);
		});

		// 监听连接断开事件
		mongoose.connection.on("disconnected", () => {
			logger.warn("MongoDB 连接断开，尝试重新连接...");
			setTimeout(connectDB, 5000); // 5秒后尝试重新连接
		});

		return conn;
	} catch (error) {
		logger.error(`MongoDB 连接失败: ${error.message}`);
		// 在开发环境下打印更多错误信息
		if (process.env.NODE_ENV === "development") {
			logger.debug(error);
		}
		// 连接失败5秒后重试
		logger.info("5秒后尝试重新连接...");
		setTimeout(connectDB, 5000);
	}
};

/**
 * 关闭数据库连接
 */
export const closeDB = async () => {
	try {
		await mongoose.connection.close();
		logger.info("MongoDB 连接已关闭");
	} catch (error) {
		logger.error(`关闭MongoDB连接时出错: ${error.message}`);
		process.exit(1);
	}
};

export default { connectDB, closeDB };
