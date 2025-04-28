/**
 * Authentication Service
 *
 * Handles all authentication-related API operations.
 */

import api from "./api";
import { Endpoints } from "../types/api";

/**
 * Authentication Service
 */
const authService = {
	/**
	 * Register a new user
	 * @param {import('../types/api').RegisterRequest} userData - User registration data
	 * @returns {Promise<import('../types/api').AuthResponse>} Registration response with token and user data
	 */
	register: async (userData) => {
		return api.post(Endpoints.REGISTER, userData, {}, false);
	},

	/**
	 * Login a user
	 * @param {import('../types/api').LoginRequest} credentials - User login credentials
	 * @returns {Promise<import('../types/api').AuthResponse>} Authentication response with token and user data
	 */
	login: async (credentials) => {
		const response = await api.post(Endpoints.LOGIN, credentials, {}, false);

		// Save the token in localStorage
		if (response && response.token) {
			localStorage.setItem("authToken", response.token);
		}

		return response;
	},

	/**
	 * Logout the current user
	 * @returns {Promise<void>}
	 */
	logout: async () => {
		try {
			// Try to notify the server about the logout
			await api.post(Endpoints.LOGOUT, {});
		} catch (error) {
			console.warn("Logout request failed:", error);
		} finally {
			// Always clear local storage, even if the server request fails
			localStorage.removeItem("authToken");
		}
	},

	/**
	 * Request a password reset link
	 * @param {import('../types/api').ForgotPasswordRequest} data - Password reset request data
	 * @returns {Promise<any>} Response data
	 */
	forgotPassword: async (data) => {
		return api.post(Endpoints.FORGOT_PASSWORD, data, {}, false);
	},

	/**
	 * Reset password with token
	 * @param {import('../types/api').ResetPasswordRequest} data - Password reset data
	 * @returns {Promise<any>} Response data
	 */
	resetPassword: async (data) => {
		return api.post(Endpoints.RESET_PASSWORD, data, {}, false);
	},

	/**
	 * Get the current user's profile
	 * @returns {Promise<import('../types/api').UserProfile>} User profile data
	 */
	getProfile: async () => {
		return api.get(Endpoints.PROFILE);
	},

	/**
	 * Update the current user's profile
	 * @param {import('../types/api').ProfileUpdateRequest} profileData - Profile data to update
	 * @returns {Promise<import('../types/api').UserProfile>} Updated user profile
	 */
	updateProfile: async (profileData) => {
		return api.put(Endpoints.PROFILE, profileData);
	},

	/**
	 * Verify the user's email with a token
	 * @param {string} token - Email verification token
	 * @returns {Promise<any>} Response data
	 */
	verifyEmail: async (token) => {
		return api.get(`${Endpoints.VERIFY_EMAIL}/${token}`, {}, false);
	},

	/**
	 * Refresh the authentication token
	 * @returns {Promise<{token: string}>} New auth token
	 */
	refreshToken: async () => {
		const response = await api.post(Endpoints.REFRESH_TOKEN, {});

		if (response && response.token) {
			localStorage.setItem("authToken", response.token);
		}

		return response;
	},

	/**
	 * Check if the user is currently authenticated
	 * @returns {boolean} True if authenticated (token exists)
	 */
	isAuthenticated: () => {
		return !!localStorage.getItem("authToken");
	},
};

export default authService;
