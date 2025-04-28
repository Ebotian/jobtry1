/**
 * @fileoverview 任务状态管理库
 *
 * 基于 Zustand 实现的任务状态管理，处理任务列表、任务操作和结果获取
 * 与后端任务 API 进行通信
 */

import { create } from "zustand";
import taskService from "../services/taskService";

/**
 * 创建任务状态管理存储
 */
const useTaskStore = create((set, get) => ({
	// 状态
	tasks: [], // 任务列表
	currentTask: null, // 当前选中的任务
	results: [], // 当前任务的结果
	isLoading: false, // 加载状态
	error: null, // 错误信息

	// 过滤和排序状态
	filters: {
		// 过滤条件
		keywords: "",
		source: "",
		isActive: null,
	},
	sorting: {
		// 排序设置
		field: "createdAt",
		order: "desc",
	},

	// 分页状态
	pagination: {
		page: 1,
		limit: 10,
		totalItems: 0,
		totalPages: 0,
	},

	/**
	 * 设置加载状态
	 * @param {boolean} status - 加载状态
	 */
	setLoading: (status) => set({ isLoading: status }),

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
	 * 设置当前任务
	 * @param {Object|null} task - 任务对象或 null
	 */
	setCurrentTask: (task) => set({ currentTask: task }),

	/**
	 * 获取任务列表
	 * @param {Object} [params={}] - 查询参数
	 * @returns {Promise<Array>} 任务列表
	 */
	fetchTasks: async (params = {}) => {
		try {
			// 设置加载状态
			set({ isLoading: true, error: null });

			// 构建请求参数
			const queryParams = {
				page: get().pagination.page,
				limit: get().pagination.limit,
				...get().filters,
				...get().sorting,
				...params,
			};

			// 过滤掉值为 null 或空字符串的参数
			Object.keys(queryParams).forEach((key) => {
				if (queryParams[key] === null || queryParams[key] === "") {
					delete queryParams[key];
				}
			});

			// 调用任务服务获取任务列表
			const response = await taskService.getAllTasks(queryParams);

			if (response && Array.isArray(response.tasks)) {
				// 更新任务列表和分页信息
				set({
					tasks: response.tasks,
					pagination: {
						...get().pagination,
						totalItems: response.totalItems || response.tasks.length,
						totalPages:
							response.totalPages ||
							Math.ceil(
								(response.totalItems || response.tasks.length) /
									get().pagination.limit
							),
					},
					isLoading: false,
				});
				return response.tasks;
			}

			// 设置空任务列表
			set({ tasks: [], isLoading: false });
			return [];
		} catch (error) {
			// 处理错误
			set({
				error: error.message || "获取任务列表失败",
				isLoading: false,
			});
			return [];
		}
	},

	/**
	 * 获取单个任务的详情
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<Object|null>} 任务对象或 null
	 */
	fetchTaskById: async (taskId) => {
		if (!taskId) return null;

		try {
			set({ isLoading: true, error: null });

			// 调用任务服务获取任务详情
			const response = await taskService.getTaskById(taskId);

			if (response && response.task) {
				// 更新当前任务
				set({
					currentTask: response.task,
					isLoading: false,
				});
				return response.task;
			}

			set({ isLoading: false });
			return null;
		} catch (error) {
			set({
				error: error.message || `获取任务详情失败: ${taskId}`,
				isLoading: false,
			});
			return null;
		}
	},

	/**
	 * 创建新任务
	 * @param {Object} taskData - 任务数据
	 * @returns {Promise<Object|null>} 创建的任务或 null
	 */
	createTask: async (taskData) => {
		try {
			set({ isLoading: true, error: null });

			// 调用任务服务创建任务
			const response = await taskService.createTask(taskData);

			if (response && response.task) {
				// 将新任务添加到列表开头
				set((state) => ({
					tasks: [response.task, ...state.tasks],
					isLoading: false,
				}));
				return response.task;
			}

			set({ isLoading: false });
			return null;
		} catch (error) {
			set({
				error: error.message || "创建任务失败",
				isLoading: false,
			});
			return null;
		}
	},

	/**
	 * 更新任务
	 * @param {string} taskId - 任务 ID
	 * @param {Object} taskData - 更新的任务数据
	 * @returns {Promise<Object|null>} 更新后的任务或 null
	 */
	updateTask: async (taskId, taskData) => {
		if (!taskId) return null;

		try {
			set({ isLoading: true, error: null });

			// 调用任务服务更新任务
			const response = await taskService.updateTask(taskId, taskData);

			if (response && response.task) {
				// 更新任务列表和当前任务
				set((state) => ({
					tasks: state.tasks.map((task) =>
						task.id === taskId ? response.task : task
					),
					currentTask:
						state.currentTask?.id === taskId
							? response.task
							: state.currentTask,
					isLoading: false,
				}));
				return response.task;
			}

			set({ isLoading: false });
			return null;
		} catch (error) {
			set({
				error: error.message || `更新任务失败: ${taskId}`,
				isLoading: false,
			});
			return null;
		}
	},

	/**
	 * 删除任务
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<boolean>} 是否删除成功
	 */
	deleteTask: async (taskId) => {
		if (!taskId) return false;

		try {
			set({ isLoading: true, error: null });

			// 调用任务服务删除任务
			await taskService.deleteTask(taskId);

			// 从列表中移除任务
			set((state) => ({
				tasks: state.tasks.filter((task) => task.id !== taskId),
				// 如果当前任务被删除，则清除当前任务
				currentTask:
					state.currentTask?.id === taskId ? null : state.currentTask,
				isLoading: false,
			}));
			return true;
		} catch (error) {
			set({
				error: error.message || `删除任务失败: ${taskId}`,
				isLoading: false,
			});
			return false;
		}
	},

	/**
	 * 启动任务
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<Object|null>} 更新后的任务或 null
	 */
	startTask: async (taskId) => {
		if (!taskId) return null;

		try {
			set({ isLoading: true, error: null });

			// 调用任务服务启动任务
			const response = await taskService.startTask(taskId);

			if (response && response.task) {
				// 更新任务列表和当前任务
				set((state) => ({
					tasks: state.tasks.map((task) =>
						task.id === taskId ? response.task : task
					),
					currentTask:
						state.currentTask?.id === taskId
							? response.task
							: state.currentTask,
					isLoading: false,
				}));
				return response.task;
			}

			set({ isLoading: false });
			return null;
		} catch (error) {
			set({
				error: error.message || `启动任务失败: ${taskId}`,
				isLoading: false,
			});
			return null;
		}
	},

	/**
	 * 停止任务
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<Object|null>} 更新后的任务或 null
	 */
	stopTask: async (taskId) => {
		if (!taskId) return null;

		try {
			set({ isLoading: true, error: null });

			// 调用任务服务停止任务
			const response = await taskService.stopTask(taskId);

			if (response && response.task) {
				// 更新任务列表和当前任务
				set((state) => ({
					tasks: state.tasks.map((task) =>
						task.id === taskId ? response.task : task
					),
					currentTask:
						state.currentTask?.id === taskId
							? response.task
							: state.currentTask,
					isLoading: false,
				}));
				return response.task;
			}

			set({ isLoading: false });
			return null;
		} catch (error) {
			set({
				error: error.message || `停止任务失败: ${taskId}`,
				isLoading: false,
			});
			return null;
		}
	},

	/**
	 * 获取任务结果
	 * @param {string} taskId - 任务 ID
	 * @param {Object} [params={}] - 查询参数
	 * @returns {Promise<Array>} 结果数组
	 */
	fetchTaskResults: async (taskId, params = {}) => {
		if (!taskId) return [];

		try {
			set({ isLoading: true, error: null });

			// 构建查询参数
			const queryParams = {
				page: get().pagination.page,
				limit: get().pagination.limit,
				...params,
			};

			// 调用任务服务获取结果
			const response = await taskService.getTaskResults(taskId, queryParams);

			if (response && Array.isArray(response.results)) {
				// 更新结果和分页信息
				set({
					results: response.results,
					pagination: {
						...get().pagination,
						totalItems: response.totalItems || response.results.length,
						totalPages:
							response.totalPages ||
							Math.ceil(
								(response.totalItems || response.results.length) /
									get().pagination.limit
							),
					},
					isLoading: false,
				});
				return response.results;
			}

			set({ results: [], isLoading: false });
			return [];
		} catch (error) {
			set({
				error: error.message || `获取任务结果失败: ${taskId}`,
				isLoading: false,
			});
			return [];
		}
	},

	/**
	 * 设置过滤条件
	 * @param {Object} newFilters - 新的过滤条件
	 */
	setFilters: (newFilters) => {
		// 更新过滤条件并重置页码
		set((state) => ({
			filters: { ...state.filters, ...newFilters },
			pagination: { ...state.pagination, page: 1 },
		}));
	},

	/**
	 * 设置排序规则
	 * @param {string} field - 排序字段
	 * @param {string} [order='asc'] - 排序方向 ('asc' 或 'desc')
	 */
	setSorting: (field, order = "asc") => {
		if (!field) return;

		// 如果排序字段相同，切换排序方向
		const newOrder =
			get().sorting.field === field && get().sorting.order === "asc"
				? "desc"
				: order;

		set({
			sorting: { field, order: newOrder },
			// 重置页码
			pagination: { ...get().pagination, page: 1 },
		});
	},

	/**
	 * 设置分页信息
	 * @param {Object} paginationData - 分页数据
	 */
	setPagination: (paginationData) => {
		set((state) => ({
			pagination: { ...state.pagination, ...paginationData },
		}));
	},

	/**
	 * 更改页码
	 * @param {number} page - 新的页码
	 */
	setPage: (page) => {
		const newPage = Math.max(
			1,
			Math.min(page, get().pagination.totalPages || 1)
		);
		set((state) => ({
			pagination: { ...state.pagination, page: newPage },
		}));
	},

	/**
	 * 更改每页条数
	 * @param {number} limit - 每页条数
	 */
	setLimit: (limit) => {
		set((state) => ({
			pagination: {
				...state.pagination,
				limit,
				page: 1, // 重置到第一页
			},
		}));
	},

	/**
	 * 重置所有状态
	 */
	resetState: () => {
		set({
			tasks: [],
			currentTask: null,
			results: [],
			error: null,
			filters: {
				keywords: "",
				source: "",
				isActive: null,
			},
			sorting: {
				field: "createdAt",
				order: "desc",
			},
			pagination: {
				page: 1,
				limit: 10,
				totalItems: 0,
				totalPages: 0,
			},
		});
	},

	/**
	 * 重置过滤条件
	 */
	resetFilters: () => {
		set({
			filters: {
				keywords: "",
				source: "",
				isActive: null,
			},
			pagination: {
				...get().pagination,
				page: 1,
			},
		});
	},
}));

export default useTaskStore;
