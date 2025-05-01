import "./loadEnv.js";
import mongoose from "mongoose";
import cron from "node-cron";
import { crawl } from "./services/crawlerService.js";
import { analyze } from "./services/aiService.js";
import Task from "./models/taskModel.js";

// 1. 每十秒打印一次时间（测试定时任务基础功能）
cron.schedule("*/10 * * * * *", () => {
  console.log("每10秒打印一次，当前时间：", new Date().toLocaleString());
});

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI);

  // 2. 每分钟执行AI爬虫分析并存入数据库
  cron.schedule("* * * * *", async () => {
    try {
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

  console.log("定时任务已启动，等待触发...");
  // 保持进程不退出
};

run();