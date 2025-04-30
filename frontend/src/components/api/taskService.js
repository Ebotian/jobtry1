import axios from "axios";

const API_BASE = "/api/tasks";

// 创建/更新任务配置
export const createOrUpdateTask = async (taskConfig) => {
	const response = await axios.post(`${API_BASE}/config`, taskConfig);
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
