/**
 * 任务服务
 * 负责任务的创建、查询、更新和删除等业务逻辑
 * 作为控制器和数据库模型之间的中间层
 */

import mongoose from "mongoose";
import Task from "../models/Task.js";
import SchedulerService from "./schedulerService.js";
import logger from "../utils/logger.js";

/**
 * 任务服务类
 * 处理与任务相关的所有业务逻辑
 */
class TaskService {
	/**
	 * 创建任务服务实例
	 * @param {Object} options - 配置选项
	 */
	constructor(options = {}) {
		this.schedulerService = options.schedulerService || new SchedulerService();
		logger.info("任务服务初始化完成");
	}

	/**
	 * 创建新任务
	 * @param {Object} taskData - 任务数据
	 * @returns {Promise<Object>} 创建的任务
	 */
	async createTask(taskData) {
		try {
			// 使用调度器服务创建任务
			const task = await this.schedulerService.createTask(taskData);
			logger.info(`成功创建任务: ${task._id}`);
			return task;
		} catch (error) {
			logger.error(`创建任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 获取单个任务详情
	 * @param {String} taskId - 任务ID
	 * @param {Object} options - 附加选项（如是否填充关联数据）
	 * @returns {Promise<Object>} 任务详情
	 */
	async getTaskById(taskId, options = {}) {
		try {
			if (!mongoose.Types.ObjectId.isValid(taskId)) {
				throw new Error("无效的任务ID格式");
			}

			let query = Task.findById(taskId);

			// 处理关联填充
			if (options.populate) {
				if (Array.isArray(options.populate)) {
					options.populate.forEach((field) => {
						query = query.populate(field);
					});
				} else if (typeof options.populate === "string") {
					query = query.populate(options.populate);
				}
			}

			const task = await query;

			if (!task) {
				throw new Error(`未找到ID为 ${taskId} 的任务`);
			}

			return task;
		} catch (error) {
			logger.error(`获取任务详情失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 更新任务
	 * @param {String} taskId - 任务ID
	 * @param {Object} updateData - 更新数据
	 * @returns {Promise<Object>} 更新后的任务
	 */
	async updateTask(taskId, updateData) {
		try {
			if (!mongoose.Types.ObjectId.isValid(taskId)) {
				throw new Error("无效的任务ID格式");
			}

			// 检查是否存在状态变更
			const originalTask = await Task.findById(taskId);
			if (!originalTask) {
				throw new Error(`未找到ID为 ${taskId} 的任务`);
			}

			// 如果调整了执行时间，需要重新调度
			if (
				updateData.scheduledFor &&
				updateData.scheduledFor !== originalTask.scheduledFor.toISOString()
			) {
				// 使用调度器服务重新调度任务
				if (originalTask.status === "pending") {
					await this.schedulerService.rescheduleTask(
						taskId,
						new Date(updateData.scheduledFor)
					);

					logger.info(`任务 ${taskId} 已重新调度至 ${updateData.scheduledFor}`);
				}
			}

			// 执行更新
			const task = await Task.findByIdAndUpdate(
				taskId,
				{ $set: updateData },
				{ new: true, runValidators: true }
			);

			logger.info(`成功更新任务: ${taskId}`);
			return task;
		} catch (error) {
			logger.error(`更新任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 删除任务
	 * @param {String} taskId - 任务ID
	 * @returns {Promise<Boolean>} 操作是否成功
	 */
	async deleteTask(taskId) {
		try {
			if (!mongoose.Types.ObjectId.isValid(taskId)) {
				throw new Error("无效的任务ID格式");
			}

			// 使用调度器服务删除任务
			const result = await this.schedulerService.deleteTask(taskId);

			if (!result) {
				throw new Error(`删除任务 ${taskId} 失败`);
			}

			logger.info(`成功删除任务: ${taskId}`);
			return true;
		} catch (error) {
			logger.error(`删除任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 分页查询任务列表
	 * @param {Object} filters - 过滤条件
	 * @param {Object} options - 查询选项
	 * @returns {Promise<Object>} 分页结果
	 */
	async getTasks(filters = {}, options = {}) {
		try {
			// 默认分页参数
			const page = parseInt(options.page) || 1;
			const limit = parseInt(options.limit) || 10;
			const skip = (page - 1) * limit;

			// 构建查询条件
			const query = this.buildQuery(filters);

			// 构建排序条件
			const sortOptions = options.sort || { createdAt: -1 };

			// 执行查询
			const tasks = await Task.find(query)
				.sort(sortOptions)
				.skip(skip)
				.limit(limit);

			// 获取总数
			const total = await Task.countDocuments(query);

			return {
				tasks,
				pagination: {
					page,
					limit,
					total,
					pages: Math.ceil(total / limit),
				},
			};
		} catch (error) {
			logger.error(`查询任务列表失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 按用户ID获取任务
	 * @param {String} userId - 用户ID
	 * @param {Object} options - 查询选项
	 * @returns {Promise<Object>} 分页结果
	 */
	async getTasksByUserId(userId, options = {}) {
		if (!mongoose.Types.ObjectId.isValid(userId)) {
			throw new Error("无效的用户ID格式");
		}

		return this.getTasks({ user: userId }, options);
	}

	/**
	 * 获取任务统计信息
	 * @param {String} userId - 用户ID（可选）
	 * @returns {Promise<Object>} 统计结果
	 */
	async getTaskStats(userId = null) {
		try {
			return await Task.getStats(userId);
		} catch (error) {
			logger.error(`获取任务统计失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 启动任务
	 * @param {String} taskId - 任务ID
	 * @returns {Promise<Object>} 启动的任务
	 */
	async startTask(taskId) {
		try {
			const task = await this.getTaskById(taskId);

			if (task.status !== "pending") {
				throw new Error(`无法启动状态为 ${task.status} 的任务`);
			}

			// 立即执行任务
			await this.schedulerService.rescheduleTask(taskId, new Date());

			return await Task.findById(taskId); // 返回最新状态
		} catch (error) {
			logger.error(`启动任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 暂停任务
	 * @param {String} taskId - 任务ID
	 * @returns {Promise<Object>} 暂停的任务
	 */
	async pauseTask(taskId) {
		try {
			const task = await this.getTaskById(taskId);

			if (task.status !== "pending") {
				throw new Error(`无法暂停状态为 ${task.status} 的任务`);
			}

			// 取消任务调度
			await this.schedulerService.cancelJob(taskId);

			// 更新状态为已取消
			return await Task.findByIdAndUpdate(
				taskId,
				{ $set: { status: "cancelled" } },
				{ new: true }
			);
		} catch (error) {
			logger.error(`暂停任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 重试失败的任务
	 * @param {String} taskId - 任务ID
	 * @returns {Promise<Object>} 重试的任务
	 */
	async retryTask(taskId) {
		try {
			const task = await this.getTaskById(taskId);

			if (task.status !== "failed") {
				throw new Error(`只能重试失败的任务，当前状态: ${task.status}`);
			}

			// 重置任务状态并安排立即执行
			await Task.findByIdAndUpdate(taskId, {
				$set: {
					status: "pending",
					failedAt: null,
					errorDetails: null,
				},
			});

			// 使用调度器立即执行
			await this.schedulerService.rescheduleTask(taskId, new Date());

			return await Task.findById(taskId); // 返回最新状态
		} catch (error) {
			logger.error(`重试任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 构建查询条件
	 * @private
	 * @param {Object} filters - 过滤参数
	 * @returns {Object} Mongoose查询对象
	 */
	buildQuery(filters) {
		const query = {};

		// 用户过滤
		if (filters.user) {
			query.user = filters.user;
		}

		// 状态过滤
		if (filters.status) {
			if (Array.isArray(filters.status)) {
				query.status = { $in: filters.status };
			} else {
				query.status = filters.status;
			}
		}

		// 优先级过滤
		if (filters.priority) {
			query.priority = filters.priority;
		}

		// 标签过滤
		if (filters.tags) {
			if (Array.isArray(filters.tags)) {
				query.tags = { $all: filters.tags };
			} else {
				query.tags = filters.tags;
			}
		}

		// 日期范围过滤
		if (filters.dateRange) {
			const { startDate, endDate } = filters.dateRange;

			if (startDate || endDate) {
				query.createdAt = {};

				if (startDate) {
					query.createdAt.$gte = new Date(startDate);
				}

				if (endDate) {
					query.createdAt.$lte = new Date(endDate);
				}
			}
		}

		// 关键词搜索
		if (filters.search) {
			const searchRegex = new RegExp(filters.search, "i");
			query.$or = [
				{ title: searchRegex },
				{ description: searchRegex },
				{ url: searchRegex },
			];
		}

		return query;
	}
}

export default TaskService;
