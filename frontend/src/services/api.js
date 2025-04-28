/**
 * API Service
 *
 * Centralized API communication service using Fetch API with modern ES6 features.
 * Handles request/response formatting, authentication, and error handling.
 */

import { Endpoints, ErrorCodes } from "../types/api";

/**
 * Default request options for fetch
 */
const defaultOptions = {
	headers: {
		"Content-Type": "application/json",
		Accept: "application/json",
	},
};

/**
 * Get stored auth token from localStorage
 * @returns {string|null} The stored token or null if not found
 */
const getAuthToken = () => localStorage.getItem("authToken");

/**
 * Add auth token to request headers if available
 * @param {Object} options - Fetch request options
 * @returns {Object} Updated options with auth token if available
 */
const withAuth = (options = {}) => {
	const token = getAuthToken();
	if (!token) return options;

	return {
		...options,
		headers: {
			...options.headers,
			Authorization: `Bearer ${token}`,
		},
	};
};

/**
 * Process API response
 * @param {Response} response - Fetch Response object
 * @returns {Promise<any>} Parsed response data
 * @throws {Error} If response is not ok
 */
const handleResponse = async (response) => {
	const contentType = response.headers.get("content-type");
	const isJson = contentType && contentType.includes("application/json");
	const data = isJson ? await response.json() : await response.text();

	if (!response.ok) {
		// Create error with the API's error information
		const error = new Error(
			(data && data.error && data.error.message) || response.statusText
		);
		error.status = response.status;
		error.code =
			(data && data.error && data.error.code) || ErrorCodes.SERVER_ERROR;
		error.response = response;
		error.data = data;
		throw error;
	}

	return data;
};

/**
 * API request wrapper with automatic error handling
 * @param {string} url - API endpoint URL
 * @param {Object} options - Fetch request options
 * @param {boolean} [requiresAuth=true] - Whether this request requires authentication
 * @returns {Promise<any>} Parsed response data
 */
const apiRequest = async (url, options = {}, requiresAuth = true) => {
	try {
		const requestOptions = {
			...defaultOptions,
			...options,
			headers: {
				...defaultOptions.headers,
				...options.headers,
			},
		};

		// Add auth token if required
		const finalOptions = requiresAuth
			? withAuth(requestOptions)
			: requestOptions;

		const response = await fetch(url, finalOptions);
		return await handleResponse(response);
	} catch (error) {
		// Handle token expiration
		if (
			error.status === 401 &&
			error.code === ErrorCodes.AUTHENTICATION_ERROR
		) {
			// Try to refresh token or redirect to login
			// This could trigger an auth event in your auth store
			console.error("Authentication error:", error.message);
			// Optional: window.dispatchEvent(new CustomEvent('auth:required'));
		}

		throw error;
	}
};

/**
 * API Service object with methods for different HTTP verbs
 */
const api = {
	/**
	 * Make a GET request
	 * @param {string} url - API endpoint URL
	 * @param {Object} [options={}] - Additional fetch options
	 * @param {boolean} [requiresAuth=true] - Whether this request requires auth
	 * @returns {Promise<any>} Parsed response data
	 */
	get: (url, options = {}, requiresAuth = true) => {
		return apiRequest(url, { ...options, method: "GET" }, requiresAuth);
	},

	/**
	 * Make a POST request
	 * @param {string} url - API endpoint URL
	 * @param {Object} data - Request payload
	 * @param {Object} [options={}] - Additional fetch options
	 * @param {boolean} [requiresAuth=true] - Whether this request requires auth
	 * @returns {Promise<any>} Parsed response data
	 */
	post: (url, data, options = {}, requiresAuth = true) => {
		return apiRequest(
			url,
			{
				...options,
				method: "POST",
				body: JSON.stringify(data),
			},
			requiresAuth
		);
	},

	/**
	 * Make a PUT request
	 * @param {string} url - API endpoint URL
	 * @param {Object} data - Request payload
	 * @param {Object} [options={}] - Additional fetch options
	 * @param {boolean} [requiresAuth=true] - Whether this request requires auth
	 * @returns {Promise<any>} Parsed response data
	 */
	put: (url, data, options = {}, requiresAuth = true) => {
		return apiRequest(
			url,
			{
				...options,
				method: "PUT",
				body: JSON.stringify(data),
			},
			requiresAuth
		);
	},

	/**
	 * Make a DELETE request
	 * @param {string} url - API endpoint URL
	 * @param {Object} [options={}] - Additional fetch options
	 * @param {boolean} [requiresAuth=true] - Whether this request requires auth
	 * @returns {Promise<any>} Parsed response data
	 */
	delete: (url, options = {}, requiresAuth = true) => {
		return apiRequest(url, { ...options, method: "DELETE" }, requiresAuth);
	},

	/**
	 * Upload file(s) with multipart/form-data
	 * @param {string} url - API endpoint URL
	 * @param {FormData} formData - FormData object with files and other form fields
	 * @param {Object} [options={}] - Additional fetch options
	 * @param {boolean} [requiresAuth=true] - Whether this request requires auth
	 * @returns {Promise<any>} Parsed response data
	 */
	upload: (url, formData, options = {}, requiresAuth = true) => {
		// Don't set Content-Type header, browser will set it automatically with boundary
		const uploadOptions = {
			...options,
			method: "POST",
			body: formData,
			headers: {
				...options.headers,
			},
		};

		// Remove Content-Type header as browser will set it with the proper boundary
		delete uploadOptions.headers["Content-Type"];

		return apiRequest(url, uploadOptions, requiresAuth);
	},
};

export default api;
