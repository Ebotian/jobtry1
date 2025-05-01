import OpenAI from "openai";

const openai = new OpenAI({
  baseURL: process.env.DEEPSEEK_API_URL || "https://api.deepseek.com",
  apiKey: process.env.DEEPSEEK_API_KEY
});

// rawData: 新闻内容数组，taskConfig: 任务参数
export const analyze = async (rawData, taskConfig) => {
  // 只拼接 title
  const prompt = rawData.map(item => item.title).join("\n\n");
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: "你是一个新闻分析助手，请对以下新闻标题进行结构化摘要和要点提取。" },
      { role: "user", content: prompt }
    ],
    model: "deepseek-chat", // 或 deepseek-reasoner
    ...taskConfig // 可扩展参数
  });
  return completion.choices[0].message; // 返回AI分析结果
};