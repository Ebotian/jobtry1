import dotenv from "dotenv";
dotenv.config();
import { crawl } from "./crawlerService.js";
import { analyze } from "./aiService.js";

const run = async () => {
  // 1. 抓取新闻
  const news = await crawl({ site: "thepaper.cn", useProxy: true }); // useProxy按需设置

  // 2. AI分析
  const aiResult = await analyze(news, {}); // 第二个参数可传模型等配置

  // 3. 输出AI分析结果
  console.log("AI分析结果：", aiResult.content);
};

run();