import Task from "../models/taskModel.js";
import * as schedulerService from "./schedulerService.js";
import * as crawlerService from "./crawlerService.js";
import * as aiService from "./aiService.js";
import mongoose from "mongoose";

// 新增结果模型
//这个模型应该放在一个单独的文件中以便于其他服务也能使用
const resultSchema = new mongoose.Schema({
	config: Object,
	result: Object,
	createdAt: { type: Date, default: Date.now },
});
const TaskResult =
	mongoose.models.TaskResult || mongoose.model("TaskResult", resultSchema);

// 停止所有任务的定时调度（除指定任务外）
export const stopAllOtherTaskSchedules = async (exceptTaskId) => {
	const tasks = await Task.find();
	for (const task of tasks) {
		if (task._id.toString() !== exceptTaskId.toString()) {
			await schedulerService.stopTaskSchedule(task);
			task.status = "stopped";
			task.enableScheduler = false;
			await task.save();
		}
	}
};

// 创建或更新唯一任务配置
export const createTask = async (taskData) => {
	// 只保留唯一配置
	await Task.deleteMany({});
	const task = await Task.create({
		...taskData,
		enableScheduler:
			typeof taskData.enableScheduler === "boolean"
				? taskData.enableScheduler
				: true,
		result: undefined, // 配置不带结果
	});
	return task;
};

// 获取唯一任务配置
export const getTasks = async () => {
	return await Task.find();
};

// 获取单个任务配置
export const getTaskById = async (id) => {
	return await Task.findById(id);
};

// 启动任务
export const startTask = async (id) => {
	const task = await Task.findById(id);
	if (!task) throw new Error("Task not found");
	await schedulerService.startTaskSchedule(task, TaskResult);
	task.status = "running";
	task.enableScheduler = true;
	await task.save();
	return { message: "Task started" };
};

// 停止任务
export const stopTask = async (id) => {
	await schedulerService.stopTaskSchedule();
	const task = await Task.findById(id);
	if (!task) throw new Error("Task not found");
	task.status = "stopped";
	task.enableScheduler = false;
	await task.save();
	return { message: "Task stopped" };
};

// 查询任务结果（返回最新一条结果）
export const getTaskResult = async (id) => {
	const latest = await TaskResult.findOne({}, {}, { sort: { createdAt: -1 } });
	return latest ? latest.result : {};
};

// 立即执行一次任务：爬取 + AI 分析，并写入结果集合
export const executeTaskOnce = async (id) => {
	const task = await Task.findById(id);
	if (!task) throw new Error("Task not found");
	// 爬取数据
	const rawData = await crawlerService.crawl(task.config);
	// AI 分析
	const aiResult = await aiService.analyze(rawData, task.config);
	// 插入新结果
	await TaskResult.create({
		config: task.config,
		result: {
			news: rawData,
			ai: aiResult.content || aiResult,
			runAt: new Date(),
			error: null,
		},
	});
	return { message: "Task executed once" };
};
