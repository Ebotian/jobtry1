import Task from "../models/taskModel.js";
import * as schedulerService from "./schedulerService.js";
import * as crawlerService from "./crawlerService.js";
import * as aiService from "./aiService.js";

// 创建或更新任务
export const createTask = async (taskData) => {
	// 若存在则更新，否则新建
	const task = await Task.findOneAndUpdate({ name: taskData.name }, taskData, {
		upsert: true,
		new: true,
	});
	return task;
};

// 获取所有任务
export const getTasks = async () => {
	return await Task.find();
};

// 获取单个任务
export const getTaskById = async (id) => {
	return await Task.findById(id);
};

// 启动任务
export const startTask = async (id) => {
	const task = await Task.findById(id);
	if (!task) throw new Error("Task not found");
	// 调用调度服务启动定时任务
	await schedulerService.startTaskSchedule(task);
	task.status = "running";
	await task.save();
	return { message: "Task started" };
};

// 停止任务
export const stopTask = async (id) => {
	const task = await Task.findById(id);
	if (!task) throw new Error("Task not found");
	await schedulerService.stopTaskSchedule(task);
	task.status = "stopped";
	await task.save();
	return { message: "Task stopped" };
};

// 查询任务结果
export const getTaskResult = async (id) => {
	const task = await Task.findById(id);
	if (!task) throw new Error("Task not found");
	return task.result || {};
};

// 立即执行一次任务
export const executeTaskOnce = async (id) => {
  const task = await Task.findById(id);
  if (!task) throw new Error("Task not found");
  // 爬取
  const rawData = await crawlerService.crawl(task.config);
  // AI分析
  const aiResult = await aiService.analyze(rawData, task.config);
  task.result = {
    news: rawData,
    ai: aiResult.content || aiResult,
    runAt: new Date(),
    error: null,
  };
  task.status = "pending";
  await task.save();
  return { message: "Task executed once" };
};