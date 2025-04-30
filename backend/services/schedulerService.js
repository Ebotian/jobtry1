import cron from "node-cron";
import Task from "../models/taskModel.js";
import * as crawlerService from "./crawlerService.js";
import * as aiService from "./aiService.js";

// 存储所有定时任务
const schedules = new Map();

// 启动定时任务
export const startTaskSchedule = async (task) => {
  if (schedules.has(task._id.toString())) return;
  // 例如每小时执行一次
  const cronExp = task.cron || "0 * * * *";
  const job = cron.schedule(cronExp, async () => {
    const rawData = await crawlerService.crawl(task.config);
    const aiResult = await aiService.analyze(rawData, task.config);
    task.result = aiResult;
    await task.save();
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
  }
};