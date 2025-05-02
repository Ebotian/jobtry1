import * as taskService from "../services/taskService.js";
import mongoose from "mongoose";

// 历史结果模型
const resultSchema = new mongoose.Schema({
	config: Object,
	result: Object,
	createdAt: { type: Date, default: Date.now },
});
const TaskResult =
	mongoose.models.TaskResult || mongoose.model("TaskResult", resultSchema);

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

// 立即执行一次任务（爬取 + 分析）
export const executeTaskOnce = async (req, res, next) => {
	try {
		const result = await taskService.executeTaskOnce(req.params.id);
		res.json(result);
	} catch (err) {
		next(err);
	}
};

// 获取所有历史结果
export const getTaskResults = async (req, res, next) => {
	try {
		const results = await TaskResult.find({}).sort({ createdAt: -1 });
		res.json(results);
	} catch (err) {
		next(err);
	}
};

// 获取最新一条历史结果
export const getLatestTaskResult = async (req, res, next) => {
	try {
		const latest = await TaskResult.findOne(
			{},
			{},
			{ sort: { createdAt: -1 } }
		);
		res.json(latest ? latest.result : {});
	} catch (err) {
		next(err);
	}
};
