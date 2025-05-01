import cron from "node-cron";
import Task from "../models/taskModel.js";
import * as crawlerService from "./crawlerService.js";
import * as aiService from "./aiService.js";

// 存储所有定时任务
const schedules = new Map();

// 启动定时任务
export const startTaskSchedule = async (task) => {
    if (schedules.has(task._id.toString())) return;
    const cronExp = task.cron || "0 * * * *";
    const job = cron.schedule(cronExp, async () => {
        try {
            const rawData = await crawlerService.crawl(task.config);
            const aiResult = await aiService.analyze(rawData, task.config);
            task.result = {
                news: rawData,
                ai: aiResult.content || aiResult,
                runAt: new Date(),
                error: null,
            };
            task.status = "pending";
            await task.save();
            console.log(`[定时任务] ${task.name} 执行成功，时间：${new Date().toLocaleString()}`);
        } catch (err) {
            task.result = {
                ...(task.result || {}),
                runAt: new Date(),
                error: err.message || String(err),
            };
            task.status = "error";
            await task.save();
            console.error(`[定时任务] ${task.name} 执行失败：`, err);
        }
    });
    schedules.set(task._id.toString(), job);
    job.start();
};

// 停止定时任务
export const stopTaskSchedule = async (task) => {
    const job = schedules.get(task._id.toString());
    if (job) {
        job.stop();
        schedules.delete(task._id.toString());
        console.log(`[定时任务] ${task.name} 已停止`);
    }
};

// 启动所有已有任务（可在 app.js 项目启动时调用）
export const startAllTaskSchedules = async () => {
    const tasks = await Task.find();
    for (const task of tasks) {
        await startTaskSchedule(task);
    }
};