import axios from "axios";

/**
 * API服务配置
 * 包含所有与后端API通信的方法
 */

// 创建axios实例，配置基础URL和超时时间
export const api = axios.create({
	baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
	timeout: 30000,
	headers: {
		"Content-Type": "application/json",
	},
});

// 请求拦截器 - 添加授权令牌
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("auth_token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截器 - 处理常见错误
api.interceptors.response.use(
	(response) => {
		return response;
	},
	(error) => {
		// 处理401未授权错误
		if (error.response && error.response.status === 401) {
			// 清除本地存储的认证信息
			localStorage.removeItem("auth_token");
			localStorage.removeItem("user");

			// 如果不是登录页，则重定向到登录页
			if (!window.location.pathname.includes("/login")) {
				window.location.href = "/login";
			}
		}

		return Promise.reject(error);
	}
);

// API方法集合
export const apiService = {
	/**
	 * 发送聊天消息到AI
	 * @param {string} message 用户消息
	 * @returns {Promise} 包含AI响应的Promise
	 */
	sendChatMessage: (message) => api.post("/ai/chat", { message }),

	/**
	 * 请求AI生成摘要
	 * @param {string} context 上下文内容
	 * @returns {Promise} 包含摘要的Promise
	 */
	generateSummary: (context) => api.post("/ai/summary", { context }),

	/**
	 * 创建新任务
	 * @param {Object} taskData 任务配置
	 * @returns {Promise} 任务创建结果
	 */
	createTask: (taskData) => api.post("/tasks", taskData),

	/**
	 * 获取任务列表
	 * @param {Object} filters 过滤条件
	 * @returns {Promise} 任务列表
	 */
	getTasks: (filters = {}) => api.get("/tasks", { params: filters }),

	/**
	 * 更新任务
	 * @param {string} taskId 任务ID
	 * @param {Object} updates 更新内容
	 * @returns {Promise} 更新结果
	 */
	updateTask: (taskId, updates) => api.put(`/tasks/${taskId}`, updates),

	/**
	 * 删除任务
	 * @param {string} taskId 任务ID
	 * @returns {Promise} 删除结果
	 */
	deleteTask: (taskId) => api.delete(`/tasks/${taskId}`),

	/**
	 * 获取任务分析结果
	 * @param {string} taskId 任务ID
	 * @returns {Promise} 分析结果
	 */
	getTaskResults: (taskId) => api.get(`/tasks/${taskId}/results`),

	/**
	 * 用户登录
	 * @param {Object} credentials 登录凭证
	 * @returns {Promise} 登录结果
	 */
	login: (credentials) => api.post("/auth/login", credentials),

	/**
	 * 用户注册
	 * @param {Object} userData 用户数据
	 * @returns {Promise} 注册结果
	 */
	register: (userData) => api.post("/auth/register", userData),
};

export default apiService;
