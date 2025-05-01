import "./loadEnv.js";
import { crawl } from "./services/crawlerService.js";
import { analyze } from "./services/aiService.js";
import mongoose from "mongoose";
import Task from "./models/taskModel.js"; // 注意这里的文件名

const run = async () => {
	await mongoose.connect(process.env.MONGODB_URI);

	// 1. 任务配置
	const config = { site: "thepaper.cn", useProxy: true };

	// 2. 抓取新闻
	const news = await crawl(config);

	// 3. AI分析
	const aiResult = await analyze(news, { analysisKeyword: "AI" });

	// 4. 打印结果
	console.log("抓取到的新闻数量：", news.length);
	console.log("前几条：", news.slice(0, 5));
	console.log("AI分析结果：", aiResult.content);

	// 4. 存入数据库
	const task = new Task({
		name: `thepaper-${Date.now()}`,
		config,
		status: "pending",
		result: {
			news,
			ai: aiResult.content,
		},
		// createdAt/updatedAt/cron自动生成
	});
	await task.save();

	console.log("已存入数据库，任务ID：", task._id);

	await mongoose.disconnect();
};

run();
