import cron from "node-cron";
import Task from "../models/taskModel.js";
import * as crawlerService from "./crawlerService.js";
import * as aiService from "./aiService.js";
import mongoose from "mongoose";

// 历史结果模型
const resultSchema = new mongoose.Schema({
	config: Object,
	result: Object,
	createdAt: { type: Date, default: Date.now },
});
const TaskResult =
	mongoose.models.TaskResult || mongoose.model("TaskResult", resultSchema);

// 动态生成 cron 表达式
function getCronExp(interval) {
	if (!interval || isNaN(interval) || interval < 1) return "0 * * * *";
	if (interval === 1) return "*/1 * * * *";
	return `*/${interval} * * * *`;
}

let currentJob = null;
let currentTaskId = null;

// 启动唯一任务调度
export const startTaskSchedule = async (task) => {
	// 停止已有 job
	if (currentJob) {
		currentJob.stop();
		currentJob = null;
		currentTaskId = null;
	}
	if (!task) return;
	const interval = task.config.interval || 60;
	const cronExp = getCronExp(interval);
	currentJob = cron.schedule(cronExp, async () => {
		try {
			const rawData = await crawlerService.crawl(task.config);
			const aiResult = await aiService.analyze(rawData, task.config);
			// 将结果保存到 TaskResult 集合
			await TaskResult.create({
				config: task.config,
				result: {
					news: rawData,
					ai: aiResult.content || aiResult,
					runAt: new Date(),
					error: null,
				},
			});
			console.log(
				`[定时任务] ${task.name} 执行成功，时间：${new Date().toLocaleString()}`
			);
		} catch (err) {
			// 错误也保存到 TaskResult
			await TaskResult.create({
				config: task.config,
				result: {
					news: [],
					ai: "",
					runAt: new Date(),
					error: err.message || String(err),
				},
			});
			console.error(`[定时任务] ${task.name} 执行失败：`, err);
		}
	});
	currentTaskId = task._id.toString();
	currentJob.start();
	console.log(`[定时任务] ${task.name} 已启动，cron: ${cronExp}`);
};

// 停止当前唯一任务调度
export const stopTaskSchedule = async () => {
	if (currentJob) {
		currentJob.stop();
		currentJob = null;
		currentTaskId = null;
		console.log("[定时任务] 已停止");
	}
};
