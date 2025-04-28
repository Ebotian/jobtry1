/**
 * @fileoverview Type definitions for API requests and responses
 * This file provides TypeScript-like type definitions using JSDoc for better IDE support
 */

/**
 * Common Types
 */

/**
 * @typedef {Object} PaginationParams
 * @property {number} [page=1] - Page number
 * @property {number} [limit=10] - Number of items per page
 * @property {string} [sortBy='createdAt'] - Field to sort by
 * @property {'asc'|'desc'} [order='desc'] - Sort order
 */

/**
 * @typedef {Object} PaginatedResponse
 * @property {Array<any>} data - Array of items
 * @property {number} totalItems - Total number of items
 * @property {number} totalPages - Total number of pages
 * @property {number} currentPage - Current page number
 */

/**
 * Authentication Types
 */

/**
 * @typedef {Object} RegisterRequest
 * @property {string} username - User's username
 * @property {string} email - User's email address
 * @property {string} password - User's password
 * @property {string} confirmPassword - Password confirmation
 */

/**
 * @typedef {Object} LoginRequest
 * @property {string} email - User's email address
 * @property {string} password - User's password
 */

/**
 * @typedef {Object} UserProfile
 * @property {string} id - User's unique ID
 * @property {string} username - User's username
 * @property {string} email - User's email address
 * @property {string} role - User's role
 */

/**
 * @typedef {Object} AuthResponse
 * @property {string} token - JWT authentication token
 * @property {UserProfile} user - User profile information
 */

/**
 * @typedef {Object} ProfileUpdateRequest
 * @property {string} [username] - User's username
 * @property {string} [email] - User's email address
 * @property {string} [password] - Current password (for verification)
 * @property {string} [newPassword] - New password
 */

/**
 * @typedef {Object} ForgotPasswordRequest
 * @property {string} email - User's email address
 */

/**
 * @typedef {Object} ResetPasswordRequest
 * @property {string} token - Password reset token
 * @property {string} password - New password
 * @property {string} confirmPassword - Password confirmation
 */

/**
 * Task Types
 */

/**
 * @typedef {Object} TaskCreateRequest
 * @property {string} keywords - Keywords to monitor
 * @property {number} interval - Monitoring interval in minutes
 * @property {string} [source] - Data source (e.g., '微博', '新闻')
 */

/**
 * @typedef {Object} TaskUpdateRequest
 * @property {string} [keywords] - Keywords to monitor
 * @property {number} [interval] - Monitoring interval in minutes
 * @property {string} [source] - Data source
 */

/**
 * @typedef {Object} TaskDetail
 * @property {string} id - Task ID
 * @property {string} userId - ID of the user who created the task
 * @property {string} keywords - Keywords being monitored
 * @property {number} interval - Monitoring interval in minutes
 * @property {string} source - Data source
 * @property {boolean} isActive - Whether the task is currently active
 * @property {Date} createdAt - Task creation date
 * @property {Date} updatedAt - Task last updated date
 * @property {Date} [lastRunAt] - When the task was last executed
 */

/**
 * @typedef {Object} TaskListResponse
 * @property {Array<TaskDetail>} tasks - Array of tasks
 */

/**
 * @typedef {Object} TaskDetailResponse
 * @property {TaskDetail} task - Task details
 */

/**
 * @typedef {Object} TaskResult
 * @property {string} id - Result ID
 * @property {string} taskId - ID of the associated task
 * @property {string} content - Result content
 * @property {string} source - Source of the result
 * @property {string} url - URL of the original content
 * @property {Date} timestamp - When the result was found
 * @property {number} sentiment - Sentiment score (-1 to 1)
 * @property {Object} metadata - Additional metadata
 */

/**
 * @typedef {Object} TaskResultsResponse
 * @property {Array<TaskResult>} results - Array of task results
 * @property {number} totalItems - Total number of results
 * @property {number} totalPages - Total number of pages
 * @property {number} currentPage - Current page number
 */

/**
 * Error Types
 */

/**
 * @typedef {Object} ApiError
 * @property {Object} error - Error information
 * @property {string} error.message - Error description
 * @property {string} error.code - Error code
 * @property {number} error.status - HTTP status code
 */

/**
 * Common error codes
 * @readonly
 * @enum {string}
 */
export const ErrorCodes = {
	VALIDATION_ERROR: "VALIDATION_ERROR",
	AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
	NOT_FOUND: "NOT_FOUND",
	PERMISSION_DENIED: "PERMISSION_DENIED",
	SERVER_ERROR: "SERVER_ERROR",
};

/**
 * API Endpoints
 * @readonly
 * @enum {string}
 */
export const Endpoints = {
	// Auth endpoints
	REGISTER: "/api/auth/register",
	LOGIN: "/api/auth/login",
	LOGOUT: "/api/auth/logout",
	REFRESH_TOKEN: "/api/auth/refresh",
	FORGOT_PASSWORD: "/api/auth/forgot-password",
	RESET_PASSWORD: "/api/auth/reset-password",
	PROFILE: "/api/auth/profile",
	VERIFY_EMAIL: "/api/auth/verify",

	// Task endpoints
	TASKS: "/api/tasks",
	TASK_DETAIL: (id) => `/api/tasks/${id}`,
	START_TASK: (id) => `/api/tasks/${id}/start`,
	STOP_TASK: (id) => `/api/tasks/${id}/stop`,
	TASK_RESULTS: (id) => `/api/tasks/${id}/results`,
};

export default {
	ErrorCodes,
	Endpoints,
};
