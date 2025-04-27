/**
 * 任务控制器
 * 处理与任务管理相关的请求
 * @module controllers/taskController
 */

import Task from "../models/Task.js";
import * as taskService from "../services/taskService.js";
import * as schedulerService from "../services/schedulerService.js";
import logger from "../utils/logger.js";

/**
 * 获取所有任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Array} 任务列表
 */
export const getAllTasks = async (req, res) => {
	try {
		// 从查询参数获取分页信息
		const { page = 1, limit = 10, status } = req.query;

		// 获取用户ID（来自认证中间件）
		const userId = req.user.id;

		// 调用服务获取任务列表
		const tasks = await taskService.getAllTasks({
			userId,
			page: parseInt(page),
			limit: parseInt(limit),
			status,
		});

		res.status(200).json({
			success: true,
			data: tasks,
		});
	} catch (error) {
		logger.error(`获取任务列表失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，获取任务列表失败",
		});
	}
};

/**
 * 创建新任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 创建的任务对象
 */
export const createTask = async (req, res) => {
	try {
		const { keywords, interval, source } = req.body;
		const userId = req.user.id;

		// 创建任务记录
		const task = await taskService.createTask({
			userId,
			keywords,
			interval,
			source,
		});

		// 设置任务调度
		if (task) {
			await schedulerService.scheduleTask(task);
		}

		res.status(201).json({
			success: true,
			message: "任务创建成功",
			data: task,
		});
	} catch (error) {
		logger.error(`创建任务失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，创建任务失败",
		});
	}
};

/**
 * 获取单个任务详情
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 任务详情
 */
export const getTaskById = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// 获取任务详情
		const task = await taskService.getTaskById(id, userId);

		if (!task) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		res.status(200).json({
			success: true,
			data: task,
		});
	} catch (error) {
		logger.error(`获取任务详情失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，获取任务详情失败",
		});
	}
};

/**
 * 更新任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 更新后的任务对象
 */
export const updateTask = async (req, res) => {
	try {
		const { id } = req.params;
		const { keywords, interval, source } = req.body;
		const userId = req.user.id;

		// 检查任务是否存在
		const existingTask = await taskService.getTaskById(id, userId);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		// 更新任务信息
		const updatedTask = await taskService.updateTask(id, {
			keywords,
			interval,
			source,
		});

		// 如果调度间隔有变化，重新调度任务
		if (existingTask.interval !== interval) {
			await schedulerService.rescheduleTask(updatedTask);
		}

		res.status(200).json({
			success: true,
			message: "任务更新成功",
			data: updatedTask,
		});
	} catch (error) {
		logger.error(`更新任务失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，更新任务失败",
		});
	}
};

/**
 * 删除任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 删除操作的结果
 */
export const deleteTask = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// 检查任务是否存在
		const existingTask = await taskService.getTaskById(id, userId);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		// 取消任务调度
		await schedulerService.cancelTask(id);

		// 从数据库删除任务
		await taskService.deleteTask(id);

		res.status(200).json({
			success: true,
			message: "任务删除成功",
		});
	} catch (error) {
		logger.error(`删除任务失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，删除任务失败",
		});
	}
};

/**
 * 启动任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 启动操作的结果
 */
export const startTask = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// 检查任务是否存在
		const existingTask = await taskService.getTaskById(id, userId);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		// 启动任务调度
		await schedulerService.startTask(id);

		// 更新任务状态
		await taskService.updateTaskStatus(id, "active");

		res.status(200).json({
			success: true,
			message: "任务启动成功",
		});
	} catch (error) {
		logger.error(`启动任务失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，启动任务失败",
		});
	}
};

/**
 * 停止任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 停止操作的结果
 */
export const stopTask = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// 检查任务是否存在
		const existingTask = await taskService.getTaskById(id, userId);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		// 停止任务调度
		await schedulerService.stopTask(id);

		// 更新任务状态
		await taskService.updateTaskStatus(id, "paused");

		res.status(200).json({
			success: true,
			message: "任务停止成功",
		});
	} catch (error) {
		logger.error(`停止任务失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，停止任务失败",
		});
	}
};

/**
 * 获取任务执行结果
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Array} 任务执行结果列表
 */
export const getTaskResults = async (req, res) => {
	try {
		const { id } = req.params;
		const { page = 1, limit = 10 } = req.query;
		const userId = req.user.id;

		// 检查任务是否存在
		const existingTask = await taskService.getTaskById(id, userId);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		// 获取任务结果
		const results = await taskService.getTaskResults(id, {
			page: parseInt(page),
			limit: parseInt(limit),
		});

		res.status(200).json({
			success: true,
			data: results,
		});
	} catch (error) {
		logger.error(`获取任务结果失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，获取任务结果失败",
		});
	}
};

/**
 * 立即执行任务
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 执行操作的结果
 */
export const executeTaskNow = async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		// 检查任务是否存在
		const existingTask = await taskService.getTaskById(id, userId);

		if (!existingTask) {
			return res.status(404).json({
				success: false,
				message: "任务不存在或无权访问",
			});
		}

		// 立即执行任务（这会是一个异步过程，不会阻塞响应）
		schedulerService
			.executeTask(id)
			.then(() => {
				logger.info(`任务 ${id} 执行完成`);
			})
			.catch((error) => {
				logger.error(`任务 ${id} 执行失败: ${error.message}`);
			});

		// 立即返回接受执行的响应
		res.status(202).json({
			success: true,
			message: "任务执行请求已接受，正在后台处理",
		});
	} catch (error) {
		logger.error(`执行任务失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，执行任务失败",
		});
	}
};
