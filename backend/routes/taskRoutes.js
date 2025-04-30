import { Router } from "express";
import {
	createTask,
	getTasks,
	getTaskById,
	startTask,
	stopTask,
	getTaskResult,
} from "../controllers/taskController.js";

const router = Router();

// 创建/更新任务配置
router.post("/config", createTask);
// 查询所有任务
router.get("/", getTasks);
// 查询单个任务
router.get("/:id", getTaskById);
// 启动任务
router.post("/:id/start", startTask);
// 停止任务
router.post("/:id/stop", stopTask);
// 查询任务结果
router.get("/:id/result", getTaskResult);

export default router;
