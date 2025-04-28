/**
 * Task Service
 *
 * Handles all task-related API operations.
 */

import api from "./api";
import { Endpoints } from "../types/api";

/**
 * Task Service
 */
const taskService = {
	/**
	 * Get all tasks
	 * @param {Object} [params] - Query parameters for filtering and pagination
	 * @param {number} [params.page] - Page number for pagination
	 * @param {number} [params.limit] - Number of items per page
	 * @param {string} [params.sortBy] - Field to sort by
	 * @param {'asc'|'desc'} [params.order] - Sort order
	 * @returns {Promise<import('../types/api').TaskListResponse>} List of tasks
	 */
	getAllTasks: async (params = {}) => {
		// Convert params object to URL search parameters
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				queryParams.append(key, value.toString());
			}
		});

		const queryString = queryParams.toString();
		const url = queryString
			? `${Endpoints.TASKS}?${queryString}`
			: Endpoints.TASKS;

		return api.get(url);
	},

	/**
	 * Get a task by ID
	 * @param {string} taskId - Task ID
	 * @returns {Promise<import('../types/api').TaskDetailResponse>} Task details
	 */
	getTaskById: async (taskId) => {
		return api.get(Endpoints.TASK_DETAIL(taskId));
	},

	/**
	 * Create a new task
	 * @param {import('../types/api').TaskCreateRequest} taskData - Task data
	 * @returns {Promise<import('../types/api').TaskDetailResponse>} Created task details
	 */
	createTask: async (taskData) => {
		return api.post(Endpoints.TASKS, taskData);
	},

	/**
	 * Update an existing task
	 * @param {string} taskId - Task ID
	 * @param {import('../types/api').TaskUpdateRequest} taskData - Task data to update
	 * @returns {Promise<import('../types/api').TaskDetailResponse>} Updated task details
	 */
	updateTask: async (taskId, taskData) => {
		return api.put(Endpoints.TASK_DETAIL(taskId), taskData);
	},

	/**
	 * Delete a task
	 * @param {string} taskId - Task ID
	 * @returns {Promise<void>}
	 */
	deleteTask: async (taskId) => {
		return api.delete(Endpoints.TASK_DETAIL(taskId));
	},

	/**
	 * Start a task
	 * @param {string} taskId - Task ID
	 * @returns {Promise<import('../types/api').TaskDetailResponse>} Updated task details
	 */
	startTask: async (taskId) => {
		return api.post(Endpoints.START_TASK(taskId));
	},

	/**
	 * Stop a task
	 * @param {string} taskId - Task ID
	 * @returns {Promise<import('../types/api').TaskDetailResponse>} Updated task details
	 */
	stopTask: async (taskId) => {
		return api.post(Endpoints.STOP_TASK(taskId));
	},

	/**
	 * Get results for a task
	 * @param {string} taskId - Task ID
	 * @param {Object} [params] - Query parameters for filtering and pagination
	 * @param {number} [params.page] - Page number for pagination
	 * @param {number} [params.limit] - Number of items per page
	 * @param {string} [params.sortBy] - Field to sort by
	 * @param {'asc'|'desc'} [params.order] - Sort order
	 * @returns {Promise<import('../types/api').TaskResultsResponse>} Task results
	 */
	getTaskResults: async (taskId, params = {}) => {
		// Convert params object to URL search parameters
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value !== undefined && value !== null) {
				queryParams.append(key, value.toString());
			}
		});

		const queryString = queryParams.toString();
		const url = queryString
			? `${Endpoints.TASK_RESULTS(taskId)}?${queryString}`
			: Endpoints.TASK_RESULTS(taskId);

		return api.get(url);
	},
};

export default taskService;
