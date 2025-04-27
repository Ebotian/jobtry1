/**
 * 任务调度器服务
 * 负责管理定时任务的创建、运行、停止和删除
 * 使用 node-schedule 作为调度核心
 */

import schedule from "node-schedule";
import mongoose from "mongoose";
import { EventEmitter } from "events";
import Task from "../models/Task.js";
import CrawlerService from "./crawlerService.js";
import AiService from "./aiService.js";
import logger from "../utils/logger.js";

/**
 * 任务调度器服务类
 * 管理系统中所有定时任务的生命周期
 */
class SchedulerService {
	/**
	 * 创建调度器服务实例
	 * @param {Object} options - 调度器配置选项
	 */
	constructor(options = {}) {
		// 存储所有活跃的调度任务
		this.jobs = new Map();

		// 事件发射器，用于任务状态通知
		this.eventEmitter = new EventEmitter();

		// 最大重试次数
		this.maxRetries = options.maxRetries || 3;

		// 守护进程检查间隔（毫秒）
		this.watchdogInterval = options.watchdogInterval || 60000;

		// 爬虫服务实例
		this.crawlerService = options.crawlerService || new CrawlerService();

		// AI服务实例
		this.aiService = options.aiService || new AiService();

		// 是否自动启动守护进程
		if (options.autoStartWatchdog !== false) {
			this.startWatchdog();
		}

		// 注册事件监听器
		this._registerEventListeners();
	}

	/**
	 * 注册任务事件监听器
	 * @private
	 */
	_registerEventListeners() {
		// 任务完成事件
		this.eventEmitter.on("task:completed", async (taskId, results) => {
			try {
				const task = await Task.findById(taskId);
				if (!task) return;

				await task.updateStatus("completed");
				logger.info(`任务 ${taskId} 完成处理`);
			} catch (error) {
				logger.error(`任务完成事件处理错误: ${error.message}`);
			}
		});

		// 任务失败事件
		this.eventEmitter.on("task:failed", async (taskId, error) => {
			try {
				const task = await Task.findById(taskId);
				if (!task) return;

				await task.updateStatus("failed", { error });
				logger.error(`任务 ${taskId} 执行失败: ${error.message}`);

				// 检查是否需要重试
				if (task.retries < this.maxRetries) {
					const retryDelay = Math.pow(2, task.retries) * 60000; // 指数退避策略
					this.rescheduleTask(taskId, new Date(Date.now() + retryDelay));
					logger.info(`任务 ${taskId} 将在 ${retryDelay / 60000} 分钟后重试`);
				}
			} catch (error) {
				logger.error(`任务失败事件处理错误: ${error.message}`);
			}
		});
	}

	/**
	 * 启动任务监控守护进程
	 * 定期检查是否有待执行的任务
	 * @returns {Object} 守护进程的定时器
	 */
	startWatchdog() {
		if (this._watchdog) {
			clearInterval(this._watchdog);
		}

		this._watchdog = setInterval(async () => {
			try {
				await this.processScheduledTasks();
			} catch (error) {
				logger.error(`任务守护进程错误: ${error.message}`);
			}
		}, this.watchdogInterval);

		logger.info(`任务守护进程已启动，检查间隔: ${this.watchdogInterval}ms`);
		return this._watchdog;
	}

	/**
	 * 停止任务监控守护进程
	 */
	stopWatchdog() {
		if (this._watchdog) {
			clearInterval(this._watchdog);
			this._watchdog = null;
			logger.info("任务守护进程已停止");
		}
	}

	/**
	 * 处理所有到期的预定任务
	 * @param {Number} limit - 每次处理的最大任务数量
	 * @returns {Promise<Array>} 已处理的任务列表
	 */
	async processScheduledTasks(limit = 10) {
		// 查找所有到期待执行的任务
		const dueTasks = await Task.findTasksDue(limit);

		if (dueTasks.length === 0) return [];

		logger.info(`发现 ${dueTasks.length} 个待执行任务`);

		const processedTasks = [];

		for (const task of dueTasks) {
			try {
				// 更新任务状态为处理中
				await task.updateStatus("processing");

				// 创建任务执行实例
				this.createScheduledJob(task);

				processedTasks.push(task);
			} catch (error) {
				logger.error(`处理任务 ${task._id} 时出错: ${error.message}`);
			}
		}

		return processedTasks;
	}

	/**
	 * 创建新任务
	 * @param {Object} taskData - 任务数据
	 * @returns {Promise<Object>} 创建的任务
	 */
	async createTask(taskData) {
		// 创建任务记录
		const task = new Task(taskData);
		await task.save();

		// 如果任务计划立即执行或已到执行时间
		const now = new Date();
		if (!task.scheduledFor || task.scheduledFor <= now) {
			task.scheduledFor = now;
			await task.save();

			// 立即创建调度任务
			this.createScheduledJob(task);
		}

		logger.info(
			`创建了新任务: ${task._id}, 计划执行时间: ${task.scheduledFor}`
		);
		return task;
	}

	/**
	 * 为任务创建调度作业
	 * @param {Object} task - 任务对象
	 * @returns {Object} 创建的定时作业
	 */
	createScheduledJob(task) {
		// 如果已有相同ID的任务正在运行，先取消它
		if (this.jobs.has(task._id.toString())) {
			this.cancelJob(task._id);
		}

		// 创建新的调度任务
		const job = schedule.scheduleJob(task.scheduledFor, async () => {
			try {
				// 执行爬虫任务
				const crawlerResults = await this.crawlerService.run(task.url, {
					depth: task.options?.depth,
					maxUrls: task.options?.maxUrls,
				});

				// 执行AI分析
				let aiResults = null;
				if (crawlerResults && task.options?.aiPrompt) {
					aiResults = await this.aiService.analyze(
						crawlerResults,
						task.options.aiPrompt
					);
				}

				// 更新任务结果
				await Task.findByIdAndUpdate(task._id, {
					$set: {
						results: {
							crawler: crawlerResults,
							ai: aiResults,
						},
					},
				});

				// 触发任务完成事件
				this.eventEmitter.emit("task:completed", task._id, {
					crawler: crawlerResults,
					ai: aiResults,
				});

				// 任务完成后从活跃任务中移除
				this.jobs.delete(task._id.toString());
			} catch (error) {
				// 触发任务失败事件
				this.eventEmitter.emit("task:failed", task._id, error);
				logger.error(`任务 ${task._id} 执行出错: ${error.message}`);

				// 任务失败后从活跃任务中移除
				this.jobs.delete(task._id.toString());
			}
		});

		// 存储作业引用
		this.jobs.set(task._id.toString(), job);

		return job;
	}

	/**
	 * 取消指定的任务
	 * @param {String} taskId - 任务ID
	 * @returns {Boolean} 是否成功取消
	 */
	async cancelJob(taskId) {
		const stringId = taskId.toString();
		const job = this.jobs.get(stringId);

		if (job) {
			job.cancel();
			this.jobs.delete(stringId);

			try {
				const task = await Task.findById(taskId);
				if (task) {
					await task.updateStatus("cancelled");
				}
			} catch (error) {
				logger.error(`更新任务状态失败: ${error.message}`);
			}

			logger.info(`已取消任务: ${taskId}`);
			return true;
		}

		return false;
	}

	/**
	 * 重新调度任务
	 * @param {String} taskId - 任务ID
	 * @param {Date} newScheduleTime - 新的调度时间
	 * @returns {Promise<Object>} 重新调度的任务
	 */
	async rescheduleTask(taskId, newScheduleTime) {
		try {
			// 取消当前正在运行的任务
			this.cancelJob(taskId);

			// 更新任务
			const task = await Task.findByIdAndUpdate(
				taskId,
				{
					$set: {
						scheduledFor: newScheduleTime,
						status: "pending",
						$inc: { retries: 1 },
					},
				},
				{ new: true }
			);

			if (!task) {
				throw new Error(`任务 ${taskId} 不存在`);
			}

			logger.info(`任务 ${taskId} 已重新调度至: ${newScheduleTime}`);
			return task;
		} catch (error) {
			logger.error(`重新调度任务失败: ${error.message}`);
			throw error;
		}
	}

	/**
	 * 删除任务及其调度
	 * @param {String} taskId - 任务ID
	 * @returns {Promise<Boolean>} 操作是否成功
	 */
	async deleteTask(taskId) {
		try {
			// 先取消调度
			this.cancelJob(taskId);

			// 然后删除数据库记录
			const result = await Task.findByIdAndDelete(taskId);

			if (!result) {
				return false;
			}

			logger.info(`已删除任务: ${taskId}`);
			return true;
		} catch (error) {
			logger.error(`删除任务失败: ${error.message}`);
			return false;
		}
	}

	/**
	 * 获取所有活跃的任务
	 * @returns {Array} 活跃任务ID列表
	 */
	getActiveJobs() {
		return Array.from(this.jobs.keys());
	}

	/**
	 * 关闭调度器服务
	 * 取消所有活跃任务并停止守护进程
	 */
	shutdown() {
		// 停止守护进程
		this.stopWatchdog();

		// 取消所有活跃任务
		for (const jobId of this.jobs.keys()) {
			const job = this.jobs.get(jobId);
			if (job) {
				job.cancel();
			}
		}

		// 清空任务映射
		this.jobs.clear();

		logger.info("调度器服务已关闭");
	}

	/**
	 * 注册事件监听器
	 * @param {String} event - 事件名称
	 * @param {Function} listener - 监听器函数
	 * @returns {EventEmitter} 事件发射器
	 */
	on(event, listener) {
		return this.eventEmitter.on(event, listener);
	}

	/**
	 * 移除事件监听器
	 * @param {String} event - 事件名称
	 * @param {Function} listener - 监听器函数
	 * @returns {EventEmitter} 事件发射器
	 */
	off(event, listener) {
		return this.eventEmitter.off(event, listener);
	}
}

export default SchedulerService;
