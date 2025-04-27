/**
 * 认证路由模块
 * @module routes/authRoutes
 */

import { Router } from "express";
import * as authController from "../controllers/authController.js";
import {
	validateRegister,
	validateLogin,
	validatePasswordReset,
} from "../middlewares/validation.js";
import { protect as authenticate } from "../middlewares/auth.js";

// 创建路由实例
const router = Router();

/**
 * 用户注册路由
 * @route POST /api/auth/register
 * @group Authentication - 用户认证操作
 * @param {string} username.body.required - 用户名
 * @param {string} email.body.required - 电子邮件
 * @param {string} password.body.required - 密码
 * @returns {object} 200 - 注册成功响应
 * @returns {Error} 400 - 输入验证错误
 * @returns {Error} 500 - 服务器错误
 */
router.post("/register", validateRegister, authController.register);

/**
 * 用户登录路由
 * @route POST /api/auth/login
 * @group Authentication - 用户认证操作
 * @param {string} email.body.required - 电子邮件
 * @param {string} password.body.required - 密码
 * @returns {object} 200 - 登录成功响应，包含令牌
 * @returns {Error} 401 - 认证失败
 * @returns {Error} 500 - 服务器错误
 */
router.post("/login", validateLogin, authController.login);

/**
 * 用户登出路由
 * @route GET /api/auth/logout
 * @group Authentication - 用户认证操作
 * @security JWT
 * @returns {object} 200 - 登出成功响应
 * @returns {Error} 401 - 未授权
 */
router.get("/logout", authenticate, authController.logout);

/**
 * 刷新访问令牌
 * @route POST /api/auth/refresh-token
 * @group Authentication - 用户认证操作
 * @param {string} refreshToken.body.required - 刷新令牌
 * @returns {object} 200 - 新的访问令牌
 * @returns {Error} 401 - 无效或过期的令牌
 */
router.post("/refresh-token", authController.refreshToken);

/**
 * 忘记密码路由 - 发送重置邮件
 * @route POST /api/auth/forgot-password
 * @group Authentication - 用户认证操作
 * @param {string} email.body.required - 用户电子邮件
 * @returns {object} 200 - 重置邮件发送成功响应
 * @returns {Error} 404 - 用户不存在
 */
router.post("/forgot-password", authController.forgotPassword);

/**
 * 重置密码路由
 * @route POST /api/auth/reset-password
 * @group Authentication - 用户认证操作
 * @param {string} token.body.required - 重置令牌
 * @param {string} newPassword.body.required - 新密码
 * @returns {object} 200 - 密码重置成功响应
 * @returns {Error} 400 - 无效请求
 * @returns {Error} 401 - 无效或过期的令牌
 */
router.post(
	"/reset-password",
	validatePasswordReset,
	authController.resetPassword
);

/**
 * 获取当前用户信息
 * @route GET /api/auth/me
 * @group Authentication - 用户认证操作
 * @security JWT
 * @returns {object} 200 - 用户信息
 * @returns {Error} 401 - 未授权
 */
router.get("/me", authenticate, authController.getCurrentUser);

// 导出路由
export default router;
