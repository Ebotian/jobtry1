/**
 * @fileoverview 任务管理自定义 Hook
 * 提供任务相关的状态管理和操作方法，与后端任务 API 通信
 */

import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// 导入服务和工具
import taskService from "../services/taskService";
import { useDebounce } from "./useDebounce";
import { buildQueryString } from "../utils/helpers";

/**
 * 任务管理自定义 Hook
 * @param {Object} options - 配置选项
 * @param {string} [options.taskId] - 初始任务 ID，用于获取特定任务
 * @param {boolean} [options.loadOnMount=true] - 是否在组件挂载时加载数据
 * @param {Object} [options.initialFilters={}] - 初始过滤条件
 * @returns {Object} 任务状态和操作方法
 */
const useTask = (options = {}) => {
	const { taskId = null, loadOnMount = true, initialFilters = {} } = options;

	// 状态管理
	const [tasks, setTasks] = useState([]);
	const [currentTask, setCurrentTask] = useState(null);
	const [results, setResults] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [filters, setFilters] = useState(initialFilters);
	const [pagination, setPagination] = useState({
		page: 1,
		limit: 10,
		totalItems: 0,
		totalPages: 0,
	});

	const navigate = useNavigate();

	// 使用防抖的过滤条件，避免频繁请求
	const debouncedFilters = useDebounce(filters, 500);

	/**
	 * 处理 API 错误
	 * @param {Error} error - 错误对象
	 * @param {string} [defaultMessage='操作失败'] - 默认错误消息
	 */
	const handleError = useCallback((error, defaultMessage = "操作失败") => {
		console.error("任务操作错误:", error);
		const errorMessage = error.message || defaultMessage;
		setError(errorMessage);
		setLoading(false);
	}, []);

	/**
	 * 获取任务列表
	 * @param {Object} [queryParams={}] - 查询参数
	 * @returns {Promise<void>}
	 */
	const fetchTasks = useCallback(
		async (queryParams = {}) => {
			try {
				setLoading(true);
				setError(null);

				const params = {
					page: pagination.page,
					limit: pagination.limit,
					...queryParams,
				};

				const response = await taskService.getAllTasks(params);

				if (response && Array.isArray(response.tasks)) {
					setTasks(response.tasks);

					// 更新分页信息
					if (response.totalItems !== undefined) {
						setPagination((prev) => ({
							...prev,
							totalItems: response.totalItems,
							totalPages:
								response.totalPages ||
								Math.ceil(response.totalItems / prev.limit),
						}));
					}
				}
			} catch (err) {
				handleError(err, "获取任务列表失败");
			} finally {
				setLoading(false);
			}
		},
		[pagination.page, pagination.limit, handleError]
	);

	/**
	 * 获取单个任务详情
	 * @param {string} id - 任务 ID
	 * @returns {Promise<void>}
	 */
	const fetchTaskById = useCallback(
		async (id) => {
			if (!id) return;

			try {
				setLoading(true);
				setError(null);

				const response = await taskService.getTaskById(id);

				if (response && response.task) {
					setCurrentTask(response.task);
				} else {
					throw new Error("无法获取任务详情");
				}
			} catch (err) {
				handleError(err, "获取任务详情失败");
				// 如果任务不存在，可以重定向到任务列表页面
				if (err.status === 404) {
					navigate("/tasks");
				}
			} finally {
				setLoading(false);
			}
		},
		[handleError, navigate]
	);

	/**
	 * 创建新任务
	 * @param {Object} taskData - 任务数据
	 * @returns {Promise<Object|null>} 创建的任务或 null（如果失败）
	 */
	const createTask = useCallback(
		async (taskData) => {
			try {
				setLoading(true);
				setError(null);

				const response = await taskService.createTask(taskData);

				if (response && response.task) {
					// 添加新任务到列表
					setTasks((prevTasks) => [response.task, ...prevTasks]);
					return response.task;
				}

				return null;
			} catch (err) {
				handleError(err, "创建任务失败");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	/**
	 * 更新任务
	 * @param {string} taskId - 任务 ID
	 * @param {Object} taskData - 更新的任务数据
	 * @returns {Promise<Object|null>} 更新后的任务或 null（如果失败）
	 */
	const updateTask = useCallback(
		async (taskId, taskData) => {
			if (!taskId) return null;

			try {
				setLoading(true);
				setError(null);

				const response = await taskService.updateTask(taskId, taskData);

				if (response && response.task) {
					// 更新任务列表和当前任务
					setTasks((prevTasks) =>
						prevTasks.map((task) => (task.id === taskId ? response.task : task))
					);

					if (currentTask && currentTask.id === taskId) {
						setCurrentTask(response.task);
					}

					return response.task;
				}

				return null;
			} catch (err) {
				handleError(err, "更新任务失败");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, currentTask]
	);

	/**
	 * 删除任务
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<boolean>} 是否删除成功
	 */
	const deleteTask = useCallback(
		async (taskId) => {
			if (!taskId) return false;

			try {
				setLoading(true);
				setError(null);

				await taskService.deleteTask(taskId);

				// 从任务列表中移除
				setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));

				// 如果删除的是当前任务，清空当前任务
				if (currentTask && currentTask.id === taskId) {
					setCurrentTask(null);
				}

				return true;
			} catch (err) {
				handleError(err, "删除任务失败");
				return false;
			} finally {
				setLoading(false);
			}
		},
		[handleError, currentTask]
	);

	/**
	 * 启动任务
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<Object|null>} 更新后的任务或 null（如果失败）
	 */
	const startTask = useCallback(
		async (taskId) => {
			if (!taskId) return null;

			try {
				setLoading(true);
				setError(null);

				const response = await taskService.startTask(taskId);

				if (response && response.task) {
					// 更新任务列表和当前任务
					setTasks((prevTasks) =>
						prevTasks.map((task) => (task.id === taskId ? response.task : task))
					);

					if (currentTask && currentTask.id === taskId) {
						setCurrentTask(response.task);
					}

					return response.task;
				}

				return null;
			} catch (err) {
				handleError(err, "启动任务失败");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, currentTask]
	);

	/**
	 * 停止任务
	 * @param {string} taskId - 任务 ID
	 * @returns {Promise<Object|null>} 更新后的任务或 null（如果失败）
	 */
	const stopTask = useCallback(
		async (taskId) => {
			if (!taskId) return null;

			try {
				setLoading(true);
				setError(null);

				const response = await taskService.stopTask(taskId);

				if (response && response.task) {
					// 更新任务列表和当前任务
					setTasks((prevTasks) =>
						prevTasks.map((task) => (task.id === taskId ? response.task : task))
					);

					if (currentTask && currentTask.id === taskId) {
						setCurrentTask(response.task);
					}

					return response.task;
				}

				return null;
			} catch (err) {
				handleError(err, "停止任务失败");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError, currentTask]
	);

	/**
	 * 获取任务结果
	 * @param {string} taskId - 任务 ID
	 * @param {Object} [queryParams={}] - 查询参数
	 * @returns {Promise<Array|null>} 任务结果数组或 null（如果失败）
	 */
	const fetchTaskResults = useCallback(
		async (taskId, queryParams = {}) => {
			if (!taskId) return null;

			try {
				setLoading(true);
				setError(null);

				const params = {
					page: 1,
					limit: 20,
					...queryParams,
				};

				const response = await taskService.getTaskResults(taskId, params);

				if (response && Array.isArray(response.results)) {
					setResults(response.results);

					// 更新分页信息
					if (response.totalItems !== undefined) {
						setPagination((prev) => ({
							...prev,
							totalItems: response.totalItems,
							totalPages:
								response.totalPages ||
								Math.ceil(response.totalItems / params.limit),
						}));
					}

					return response.results;
				}

				return null;
			} catch (err) {
				handleError(err, "获取任务结果失败");
				return null;
			} finally {
				setLoading(false);
			}
		},
		[handleError]
	);

	/**
	 * 更新过滤条件
	 * @param {Object} newFilters - 新的过滤条件
	 */
	const updateFilters = useCallback((newFilters) => {
		setFilters((prev) => ({
			...prev,
			...newFilters,
		}));

		// 重置页码
		setPagination((prev) => ({
			...prev,
			page: 1,
		}));
	}, []);

	/**
	 * 更改页码
	 * @param {number} newPage - 新的页码
	 */
	const changePage = useCallback(
		(newPage) => {
			if (newPage > 0 && newPage <= pagination.totalPages) {
				setPagination((prev) => ({
					...prev,
					page: newPage,
				}));
			}
		},
		[pagination.totalPages]
	);

	/**
	 * 更改每页显示数量
	 * @param {number} newLimit - 新的限制数
	 */
	const changeLimit = useCallback((newLimit) => {
		setPagination((prev) => ({
			...prev,
			limit: newLimit,
			page: 1, // 重置到第一页
		}));
	}, []);

	/**
	 * 清除错误
	 */
	const clearError = useCallback(() => {
		setError(null);
	}, []);

	/**
	 * 重置状态
	 */
	const resetState = useCallback(() => {
		setTasks([]);
		setCurrentTask(null);
		setResults([]);
		setError(null);
		setFilters(initialFilters);
		setPagination({
			page: 1,
			limit: 10,
			totalItems: 0,
			totalPages: 0,
		});
	}, [initialFilters]);

	// 当过滤条件变化时，重新获取任务列表
	useEffect(() => {
		if (loadOnMount) {
			fetchTasks(debouncedFilters);
		}
	}, [debouncedFilters, loadOnMount, fetchTasks]);

	// 如果提供了任务 ID，在组件挂载时获取任务详情
	useEffect(() => {
		if (taskId && loadOnMount) {
			fetchTaskById(taskId);
		}
	}, [taskId, loadOnMount, fetchTaskById]);

	// 当页码或每页数量变化时，重新获取数据
	useEffect(() => {
		if (loadOnMount && !taskId) {
			fetchTasks({
				...debouncedFilters,
				page: pagination.page,
				limit: pagination.limit,
			});
		}

		if (loadOnMount && taskId && currentTask) {
			fetchTaskResults(taskId, {
				page: pagination.page,
				limit: pagination.limit,
			});
		}
	}, [
		pagination.page,
		pagination.limit,
		loadOnMount,
		fetchTasks,
		fetchTaskResults,
		taskId,
		currentTask,
		debouncedFilters,
	]);

	// 导出的 API
	return {
		// 状态
		tasks,
		currentTask,
		results,
		loading,
		error,
		filters,
		pagination,

		// 任务操作
		fetchTasks,
		fetchTaskById,
		createTask,
		updateTask,
		deleteTask,
		startTask,
		stopTask,
		fetchTaskResults,

		// 过滤和分页
		updateFilters,
		changePage,
		changeLimit,

		// 工具方法
		clearError,
		resetState,
	};
};

export default useTask;
