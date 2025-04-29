/**
 * @fileoverview API 服务基础设置
 * 配置 Axios 实例，添加请求/响应拦截器，处理授权和错误
 */

import axios from "axios";

// 创建 axios 实例
const api = axios.create({
	baseURL: "http://localhost:5000/api", // 指向运行在 5000 端口的后端服务
	timeout: 1000000,//请求超时时间
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
});

// 请求拦截器 - 添加 token
api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers["Authorization"] = `Bearer ${token}`;
		}
		return config;
	},
	(error) => {
		return Promise.reject(error);
	}
);

// 响应拦截器 - 处理错误和刷新 token
api.interceptors.response.use(
	(response) => {
		return response;
	},
	async (error) => {
		const originalRequest = error.config;

		// 如果是 401 错误（未授权）且不是刷新 token 的请求
		if (
			error.response?.status === 401 &&
			!originalRequest._retry &&
			!originalRequest.url.includes("auth/refresh") &&
			!originalRequest.url.includes("auth/login")
		) {
			originalRequest._retry = true;

			try {
				// 尝试刷新 token
				const refreshToken = localStorage.getItem("refreshToken");
				if (refreshToken) {
					const res = await axios.post(
						"http://localhost:5000/api/auth/refresh",
						{},
						{
							headers: { Authorization: `Bearer ${refreshToken}` },
						}
					);

					if (res.data.token) {
						// 保存新 token
						localStorage.setItem("token", res.data.token);

						// 更新原请求的 token 并重试
						originalRequest.headers[
							"Authorization"
						] = `Bearer ${res.data.token}`;
						return axios(originalRequest);
					}
				}

				// 刷新失败，可能需要重新登录
				localStorage.removeItem("token");
				localStorage.removeItem("refreshToken");
				window.location.href = "/login";
			} catch (refreshError) {
				// 刷新 token 失败，清除用户信息并重定向到登录页
				localStorage.removeItem("token");
				localStorage.removeItem("refreshToken");
				window.location.href = "/login";
				return Promise.reject(refreshError);
			}
		}

		return Promise.reject(error);
	}
);

export default api;
