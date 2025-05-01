import axios from "axios";

const API_BASE = "/api/tasks";

// 创建/更新任务配置
export const createOrUpdateTask = async (config) => {
	// 生成唯一任务名，建议用 site-分析关键词 组合
	const name = `${config.site}-${config.analysisKeyword || ""}`;
	const response = await axios.post(`${API_BASE}/config`, {
		name,
		config,
	});
	return response.data;
};

// 获取所有任务
export const getTasks = async () => {
	const response = await axios.get(API_BASE);
	return response.data;
};

// 获取单个任务详情
export const getTaskById = async (id) => {
	const response = await axios.get(`${API_BASE}/${id}`);
	return response.data;
};

// 启动任务
export const startTask = async (id) => {
	const response = await axios.post(`${API_BASE}/${id}/start`);
	return response.data;
};

// 停止任务
export const stopTask = async (id) => {
	const response = await axios.post(`${API_BASE}/${id}/stop`);
	return response.data;
};

// 获取任务结果
export const getTaskResult = async (id) => {
	const response = await axios.get(`${API_BASE}/${id}/result`);
	return response.data;
};

// 立即执行一次任务
export const executeTaskOnce = async (id) => {
	const response = await axios.post(`${API_BASE}/${id}/execute`);
	return response.data;
};
