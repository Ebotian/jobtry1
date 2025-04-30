import axios from "axios";

// 调用 DeepSeek AI API 进行分析
export const analyze = async (rawData, taskConfig) => {
  // 这里假设 rawData 是新闻内容数组，taskConfig 包含分析参数
  const apiKey = process.env.DEEPSEEK_API_KEY;
  const endpoint = process.env.DEEPSEEK_API_URL || "https://api.deepseek.com/analyze";
  const response = await axios.post(
    endpoint,
    { data: rawData, config: taskConfig },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );
  return response.data; // 返回结构化AI分析结果
};