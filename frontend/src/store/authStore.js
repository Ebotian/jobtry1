/**
 * @fileoverview 认证状态管理库
 *
 * 基于 Zustand 实现的认证状态管理，处理用户登录、注册、登出等操作
 * 并与后端身份验证 API 通信
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import authService from "../services/authService";

/**
 * 创建认证状态管理存储
 * 使用 Zustand persist 中间件实现状态持久化
 */
const useAuthStore = create(
	persist(
		(set, get) => ({
			// 初始状态
			user: null, // 用户信息
			isAuthenticated: false, // 是否已认证
			isLoading: false, // 加载状态
			error: null, // 错误信息

			/**
			 * 设置加载状态
			 * @param {boolean} isLoading - 加载状态
			 */
			setLoading: (isLoading) => set({ isLoading }),

			/**
			 * 设置错误信息
			 * @param {string|null} error - 错误信息
			 */
			setError: (error) => set({ error }),

			/**
			 * 清除错误信息
			 */
			clearError: () => set({ error: null }),

			/**
			 * 注册新用户
			 * @param {Object} userData - 用户注册数据
			 * @param {string} userData.username - 用户名
			 * @param {string} userData.email - 电子邮件
			 * @param {string} userData.password - 密码
			 * @param {string} userData.confirmPassword - 确认密码
			 * @returns {Promise<Object>} 结果对象，包含成功状态和可能的错误信息
			 */
			register: async (userData) => {
				try {
					// 设置加载状态
					set({ isLoading: true, error: null });

					// 调用认证服务进行注册
					const response = await authService.register(userData);

					// 如果注册成功，自动登录用户
					if (response && response.token && response.user) {
						set({
							user: response.user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
						return { success: true };
					}

					set({ isLoading: false });
					return { success: false, error: "注册失败，请稍后重试" };
				} catch (error) {
					const errorMsg = error.message || "注册失败，请稍后重试";
					set({ isLoading: false, error: errorMsg });
					return { success: false, error: errorMsg };
				}
			},

			/**
			 * 用户登录
			 * @param {Object} credentials - 登录凭证
			 * @param {string} credentials.email - 电子邮件
			 * @param {string} credentials.password - 密码
			 * @returns {Promise<Object>} 结果对象，包含成功状态和可能的错误信息
			 */
			login: async (credentials) => {
				try {
					// 设置加载状态
					set({ isLoading: true, error: null });

					// 调用认证服务进行登录
					const response = await authService.login(credentials);

					// 成功登录后设置用户信息和认证状态
					if (response && response.token && response.user) {
						set({
							user: response.user,
							isAuthenticated: true,
							isLoading: false,
							error: null,
						});
						return { success: true };
					}

					set({ isLoading: false });
					return { success: false, error: "登录失败，请检查您的凭证" };
				} catch (error) {
					const errorMsg = error.message || "登录失败，请稍后重试";
					set({ isLoading: false, error: errorMsg });
					return { success: false, error: errorMsg };
				}
			},

			/**
			 * 用户登出
			 * @returns {Promise<void>}
			 */
			logout: async () => {
				try {
					// 设置加载状态
					set({ isLoading: true });

					// 调用认证服务进行登出
					await authService.logout();
				} catch (error) {
					console.warn("登出时出错:", error);
				} finally {
					// 无论后端请求成功与否，都清除本地认证状态
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
				}
			},

			/**
			 * 刷新认证令牌
			 * @returns {Promise<boolean>} 是否成功刷新
			 */
			refreshToken: async () => {
				try {
					// 如果未认证，则不需要刷新
					if (!get().isAuthenticated) {
						return false;
					}

					set({ isLoading: true });

					// 调用认证服务刷新令牌
					const response = await authService.refreshToken();

					if (response && response.token) {
						// 更新认证状态
						set({
							isLoading: false,
							isAuthenticated: true,
							error: null,
						});
						return true;
					}

					// 如果刷新失败，清除认证状态
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: null,
					});
					return false;
				} catch (error) {
					console.error("刷新令牌失败:", error);

					// 刷新失败，清除认证状态
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: error.message || "认证已过期，请重新登录",
					});
					return false;
				}
			},

			/**
			 * 获取当前用户信息
			 * @returns {Promise<Object|null>} 用户信息或 null
			 */
			getCurrentUser: async () => {
				try {
					// 如果用户信息已存在且已认证，直接返回
					if (get().user && get().isAuthenticated) {
						return get().user;
					}

					// 如果有令牌但没有用户信息，尝试获取用户信息
					if (authService.isAuthenticated()) {
						set({ isLoading: true, error: null });

						const userProfile = await authService.getProfile();

						if (userProfile) {
							set({
								user: userProfile,
								isAuthenticated: true,
								isLoading: false,
								error: null,
							});
							return userProfile;
						}
					}

					set({ isLoading: false });
					return null;
				} catch (error) {
					set({
						user: null,
						isAuthenticated: false,
						isLoading: false,
						error: error.message || "获取用户信息失败",
					});
					return null;
				}
			},

			/**
			 * 更新用户信息
			 * @param {Object} profileData - 要更新的用户信息
			 * @returns {Promise<Object>} 结果对象，包含成功状态和可能的错误信息
			 */
			updateProfile: async (profileData) => {
				try {
					// 检查是否已认证
					if (!get().isAuthenticated) {
						return { success: false, error: "未认证，请先登录" };
					}

					set({ isLoading: true, error: null });

					// 调用认证服务更新用户信息
					const updatedUser = await authService.updateProfile(profileData);

					if (updatedUser) {
						// 更新本地用户信息
						set({
							user: updatedUser,
							isLoading: false,
							error: null,
						});
						return { success: true };
					}

					set({ isLoading: false });
					return { success: false, error: "更新用户信息失败" };
				} catch (error) {
					const errorMsg = error.message || "更新用户信息失败";
					set({ isLoading: false, error: errorMsg });
					return { success: false, error: errorMsg };
				}
			},

			/**
			 * 发送密码重置请求
			 * @param {Object} data - 包含邮箱的对象
			 * @param {string} data.email - 用户邮箱
			 * @returns {Promise<Object>} 结果对象，包含成功状态和可能的错误信息
			 */
			forgotPassword: async (data) => {
				try {
					set({ isLoading: true, error: null });

					// 调用认证服务发送密码重置请求
					await authService.forgotPassword(data);

					set({ isLoading: false });
					return { success: true };
				} catch (error) {
					const errorMsg = error.message || "发送重置密码邮件失败";
					set({ isLoading: false, error: errorMsg });
					return { success: false, error: errorMsg };
				}
			},

			/**
			 * 重置密码
			 * @param {Object} data - 重置密码数据
			 * @param {string} data.token - 重置令牌
			 * @param {string} data.password - 新密码
			 * @param {string} data.confirmPassword - 确认新密码
			 * @returns {Promise<Object>} 结果对象，包含成功状态和可能的错误信息
			 */
			resetPassword: async (data) => {
				try {
					set({ isLoading: true, error: null });

					// 调用认证服务重置密码
					await authService.resetPassword(data);

					set({ isLoading: false });
					return { success: true };
				} catch (error) {
					const errorMsg = error.message || "重置密码失败";
					set({ isLoading: false, error: errorMsg });
					return { success: false, error: errorMsg };
				}
			},

			/**
			 * 验证邮箱
			 * @param {string} token - 验证令牌
			 * @returns {Promise<Object>} 结果对象，包含成功状态和可能的错误信息
			 */
			verifyEmail: async (token) => {
				try {
					set({ isLoading: true, error: null });

					// 调用认证服务验证邮箱
					await authService.verifyEmail(token);

					set({ isLoading: false });
					return { success: true };
				} catch (error) {
					const errorMsg = error.message || "邮箱验证失败";
					set({ isLoading: false, error: errorMsg });
					return { success: false, error: errorMsg };
				}
			},
		}),
		{
			// Zustand persist 配置
			name: "auth-storage", // 存储键名
			getStorage: () => localStorage, // 使用 localStorage
			partialize: (state) => ({
				// 只持久化这些字段
				user: state.user,
				isAuthenticated: state.isAuthenticated,
			}),
		}
	)
);

export default useAuthStore;
