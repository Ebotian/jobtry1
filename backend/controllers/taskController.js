import * as taskService from "../services/taskService.js";

// 创建新任务
export const createTask = async (req, res, next) => {
	try {
		const task = await taskService.createTask(req.body);
		res.status(201).json(task);
	} catch (err) {
		next(err);
	}
};

// 获取所有任务
export const getTasks = async (req, res, next) => {
	try {
		const tasks = await taskService.getTasks();
		res.json(tasks);
	} catch (err) {
		next(err);
	}
};

// 获取单个任务详情
export const getTaskById = async (req, res, next) => {
	try {
		const task = await taskService.getTaskById(req.params.id);
		if (!task) return res.status(404).json({ message: "Task not found" });
		res.json(task);
	} catch (err) {
		next(err);
	}
};

// 启动任务
export const startTask = async (req, res, next) => {
	try {
		const result = await taskService.startTask(req.params.id);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

// 停止任务
export const stopTask = async (req, res, next) => {
	try {
		const result = await taskService.stopTask(req.params.id);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

// 查询任务结果
export const getTaskResult = async (req, res, next) => {
	try {
		const result = await taskService.getTaskResult(req.params.id);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

export const executeTaskOnce = async (req, res, next) => {
  try {
    const result = await taskService.executeTaskOnce(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
};