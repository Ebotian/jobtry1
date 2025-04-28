import { useState, useEffect } from "react";
import apiService from "../services/api";

/**
 * 认证钩子
 * 提供登录、注册及认证状态管理
 */
export function useAuth() {
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	// 初始加载时检查本地存储令牌
	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		setIsAuthenticated(!!token);
	}, []);

	// 登录方法
	const login = async (username, password) => {
		try {
			const response = await apiService.login({ email: username, password });
			const { token, refreshToken, user } = response.data.data;
			// 存储认证信息
			localStorage.setItem("auth_token", token);
			localStorage.setItem("refresh_token", refreshToken);
			localStorage.setItem("user", JSON.stringify(user));
			setIsAuthenticated(true);
			return response.data;
		} catch (err) {
			// 用户不存在或认证失败
			if (err.response && err.response.status === 401) {
				return { error: "user_not_found" };
			}
			throw err;
		}
	};

	// 注册方法
	const register = async (username, password, email) => {
		const response = await apiService.register({ username, email, password });
		const { token, refreshToken, user } = response.data.data;
		localStorage.setItem("auth_token", token);
		localStorage.setItem("refresh_token", refreshToken);
		localStorage.setItem("user", JSON.stringify(user));
		setIsAuthenticated(true);
		return response.data;
	};

	// 登出方法
	const logout = () => {
		localStorage.removeItem("auth_token");
		localStorage.removeItem("refresh_token");
		localStorage.removeItem("user");
		setIsAuthenticated(false);
	};

	return { isAuthenticated, login, register, logout };
}
