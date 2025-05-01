import "./loadEnv.js";
import mongoose from "mongoose";
import cron from "node-cron";
import { crawl } from "./services/crawlerService.js";
import { analyze } from "./services/aiService.js";
import Task from "./models/taskModel.js";

// 定时任务开关
const enableScheduler = true;
let nextRunTime = null;

// 1. 每十秒打印一次时间（测试定时任务基础功能）
cron.schedule("*/10 * * * * *", () => {
	console.log("每10秒打印一次，当前时间：", new Date().toLocaleString());
});

const run = async () => {
	await mongoose.connect(process.env.MONGODB_URI);

	if (enableScheduler) {
		// 2. 每分钟执行AI爬虫分析并存入数据库
		cron.schedule("* * * * *", async () => {
			try {
				const now = new Date();
				nextRunTime = new Date(now.getTime() + 60 * 1000);
				const config = { site: "thepaper.cn", useProxy: true };
				const news = await crawl(config);
				const aiResult = await analyze(news, {});
				const task = new Task({
					name: `thepaper-${Date.now()}`,
					config,
					status: "pending",
					result: {
						news,
						ai: aiResult.content,
					},
				});
				await task.save();
				console.log("每分钟任务已存入数据库，任务ID：", task._id);
			} catch (err) {
				console.error("每分钟任务执行失败：", err);
			}
		});
		// 倒计时显示
		setInterval(() => {
			if (nextRunTime) {
				const now = new Date();
				const diff = Math.max(0, Math.floor((nextRunTime - now) / 1000));
				process.stdout.write(`\r距离下次定时任务执行还有 ${diff} 秒   `);
			}
		}, 1000);
	} else {
		console.log("定时任务已关闭 (enableScheduler = false)");
	}

	console.log("定时任务已启动，等待触发...");
	// 保持进程不退出
};

run();
