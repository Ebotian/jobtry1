/**
 * @fileoverview UI 状态管理
 * 使用 Zustand 管理全局 UI 状态，如主题、侧边栏、模态框、通知等
 * 仅前端本地状态，无需与后端 API 通信
 */

import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

// 默认模态框状态
const defaultModals = {
	login: false,
	register: false,
	taskForm: false,
	confirm: false,
};

// 默认通知持续时间（毫秒）
const DEFAULT_NOTIFICATION_DURATION = 5000;

const useUIStore = create((set, get) => ({
	// 主题: 'light' | 'dark' | 'system'
	theme: "system",
	// 侧边栏是否展开
	sidebarOpen: true,
	// 当前语言
	language: "zh-CN",
	// 模态框状态
	modals: { ...defaultModals },
	// 通知列表
	notifications: [],

	/** 设置主题 */
	setTheme: (theme) => set({ theme }),

	/** 切换侧边栏展开/收起 */
	toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

	/** 设置语言 */
	setLanguage: (lang) => set({ language: lang }),

	/** 打开指定模态框 */
	openModal: (modalName) =>
		set((state) => ({
			modals: { ...state.modals, [modalName]: true },
		})),

	/** 关闭指定模态框 */
	closeModal: (modalName) =>
		set((state) => ({
			modals: { ...state.modals, [modalName]: false },
		})),

	/** 关闭所有模态框 */
	closeAllModals: () => set({ modals: { ...defaultModals } }),

	/** 添加通知（支持自动移除） */
	addNotification: ({
		type = "info",
		message,
		duration = DEFAULT_NOTIFICATION_DURATION,
	}) => {
		const id = uuidv4();
		const notification = {
			id,
			type, // 'info' | 'success' | 'warning' | 'error'
			message,
			timestamp: new Date(),
			duration,
		};
		set((state) => ({ notifications: [...state.notifications, notification] }));
		// 自动移除通知
		if (duration > 0) {
			setTimeout(() => {
				get().removeNotification(id);
			}, duration);
		}
		return id;
	},

	/** 移除通知 */
	removeNotification: (id) =>
		set((state) => ({
			notifications: state.notifications.filter((n) => n.id !== id),
		})),

	/** 清空所有通知 */
	clearNotifications: () => set({ notifications: [] }),

	/** 重置 UI 状态为默认 */
	resetUI: () =>
		set({
			theme: "system",
			sidebarOpen: true,
			language: "zh-CN",
			modals: { ...defaultModals },
			notifications: [],
		}),
}));

export default useUIStore;
