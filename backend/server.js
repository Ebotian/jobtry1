/**
 * 主服务器文件
 * 负责初始化Express应用、连接数据库并启动服务器
 */

import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import aiRoutes from "./routes/aiRoutes.js"; // 导入 AI 路由
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./utils/logger.js";
import crawlerRoutes from './routes/crawlerRoutes.js';


// 加载环境变量
dotenv.config();

// 初始化Express应用
const app = express();
const PORT = process.env.PORT || 5000;

// 连接到数据库
connectDB();

// 配置中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 日志记录
app.use((req, res, next) => {
	logger.info(`${req.method} ${req.originalUrl}`);
	next();
});

// 挂载路由
app.use("/api/tasks", taskRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/ai", aiRoutes); // 添加 AI 路由
app.use('/api/crawler', crawlerRoutes);

// 健康检查路由
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok", message: "服务器运行正常" });
});

// 处理未找到的路由
app.use("*", (req, res) => {
	res.status(404).json({ message: "未找到请求的资源" });
});

// 全局错误处理中间件
app.use(errorHandler);

// 启动服务器
const server = app.listen(PORT, () => {
	logger.info(`服务器在端口 ${PORT} 上运行`);
});

// 处理未捕获的异常
process.on("unhandledRejection", (err) => {
	logger.error(`未处理的Promise拒绝: ${err.message}`);
	// 优雅地关闭服务器
	server.close(() => {
		process.exit(1);
	});
});

export default app;
