/**
 * 任务路由模块
 * @module routes/taskRoutes
 */

import { Router } from "express";
import * as taskController from "../controllers/taskController.js";
import { protect as authenticate } from "../middlewares/auth.js";
import { validateTask } from "../middlewares/validation.js";

// 创建路由实例
const router = Router();

/**
 * 获取所有任务
 * @route GET /api/tasks
 * @group Tasks - 任务管理操作
 * @security JWT
 * @returns {Array} 200 - 任务列表
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.get("/", authenticate, taskController.getAllTasks);

/**
 * 创建新任务
 * @route POST /api/tasks
 * @group Tasks - 任务管理操作
 * @param {string} keywords.body.required - 监控关键词
 * @param {number} interval.body.required - 执行间隔（分钟）
 * @param {string} source.body - 数据源（如"微博"、"新闻"等）
 * @security JWT
 * @returns {object} 201 - 创建的任务
 * @returns {Error} 400 - 无效的请求数据
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.post("/", authenticate, validateTask, taskController.createTask);

/**
 * 获取单个任务详情
 * @route GET /api/tasks/:id
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @security JWT
 * @returns {object} 200 - 任务详情
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.get("/:id", authenticate, taskController.getTaskById);

/**
 * 更新任务
 * @route PUT /api/tasks/:id
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @param {string} keywords.body - 监控关键词
 * @param {number} interval.body - 执行间隔（分钟）
 * @param {string} source.body - 数据源
 * @security JWT
 * @returns {object} 200 - 更新后的任务
 * @returns {Error} 400 - 无效的请求数据
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.put("/:id", authenticate, validateTask, taskController.updateTask);

/**
 * 删除任务
 * @route DELETE /api/tasks/:id
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @security JWT
 * @returns {object} 200 - 删除成功响应
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.delete("/:id", authenticate, taskController.deleteTask);

/**
 * 启动任务
 * @route POST /api/tasks/:id/start
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @security JWT
 * @returns {object} 200 - 启动成功响应
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.post("/:id/start", authenticate, taskController.startTask);

/**
 * 停止任务
 * @route POST /api/tasks/:id/stop
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @security JWT
 * @returns {object} 200 - 停止成功响应
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.post("/:id/stop", authenticate, taskController.stopTask);

/**
 * 获取任务执行结果
 * @route GET /api/tasks/:id/results
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @param {number} limit.query - 结果数量限制
 * @param {number} page.query - 分页页码
 * @security JWT
 * @returns {Array} 200 - 任务结果列表
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.get("/:id/results", authenticate, taskController.getTaskResults);

/**
 * 立即执行任务（不等待调度）
 * @route POST /api/tasks/:id/execute
 * @group Tasks - 任务管理操作
 * @param {string} id.path.required - 任务ID
 * @security JWT
 * @returns {object} 202 - 任务执行已接受
 * @returns {Error} 404 - 任务不存在
 * @returns {Error} 401 - 未授权
 * @returns {Error} 500 - 服务器错误
 */
router.post("/:id/execute", authenticate, taskController.executeTaskNow);

// 导出路由
export default router;
