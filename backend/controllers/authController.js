/**
 * 认证控制器
 * 处理用户认证相关的逻辑
 * @module controllers/authController
 */

import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { sendEmail } from "../utils/helpers.js";
import logger from "../utils/logger.js";
import {
	JWT_SECRET,
	JWT_EXPIRES_IN,
	JWT_REFRESH_EXPIRES_IN,
} from "../config/env.js";

/**
 * 用户注册
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 包含用户信息和访问令牌的响应
 */
export const register = async (req, res) => {
	try {
		const { username, email, password } = req.body;

		// 检查用户是否已存在
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "该邮箱已被注册",
			});
		}

		// 加密密码
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// 创建新用户
		const newUser = new User({
			username,
			email,
			password: hashedPassword,
		});

		// 保存用户到数据库
		const savedUser = await newUser.save();

		// 生成访问令牌
		const token = generateAccessToken(savedUser._id);

		// 生成刷新令牌
		const refreshToken = generateRefreshToken(savedUser._id);

		res.status(201).json({
			success: true,
			message: "注册成功",
			data: {
				user: {
					id: savedUser._id,
					username: savedUser.username,
					email: savedUser.email,
				},
				token,
				refreshToken,
			},
		});
	} catch (error) {
		logger.error(`注册失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，注册失败",
		});
	}
};

/**
 * 用户登录
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 包含用户信息和访问令牌的响应
 */
export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		// 查找用户
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "用户名或密码不正确",
			});
		}

		// 验证密码
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(401).json({
				success: false,
				message: "用户名或密码不正确",
			});
		}

		// 生成访问令牌
		const token = generateAccessToken(user._id);

		// 生成刷新令牌
		const refreshToken = generateRefreshToken(user._id);

		// 更新用户的最后登录时间
		user.lastLogin = Date.now();
		await user.save();

		res.status(200).json({
			success: true,
			message: "登录成功",
			data: {
				user: {
					id: user._id,
					username: user.username,
					email: user.email,
				},
				token,
				refreshToken,
			},
		});
	} catch (error) {
		logger.error(`登录失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，登录失败",
		});
	}
};

/**
 * 用户登出
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 成功登出的响应
 */
export const logout = async (req, res) => {
	// 在实际项目中，可能需要将令牌添加到黑名单
	// 这里简化处理，前端只需要删除本地存储的令牌
	res.status(200).json({
		success: true,
		message: "成功登出",
	});
};

/**
 * 刷新访问令牌
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 包含新的访问令牌的响应
 */
export const refreshToken = async (req, res) => {
	try {
		const { refreshToken } = req.body;

		if (!refreshToken) {
			return res.status(401).json({
				success: false,
				message: "缺少刷新令牌",
			});
		}

		// 验证刷新令牌
		let decoded;
		try {
			decoded = jwt.verify(refreshToken, JWT_SECRET);
		} catch (error) {
			return res.status(401).json({
				success: false,
				message: "无效的刷新令牌",
			});
		}

		// 检查用户是否存在
		const user = await User.findById(decoded.id);
		if (!user) {
			return res.status(401).json({
				success: false,
				message: "用户不存在",
			});
		}

		// 生成新的访问令牌
		const token = generateAccessToken(user._id);

		res.status(200).json({
			success: true,
			message: "令牌刷新成功",
			data: {
				token,
			},
		});
	} catch (error) {
		logger.error(`刷新令牌失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，令牌刷新失败",
		});
	}
};

/**
 * 忘记密码 - 发送重置邮件
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 发送重置邮件的结果
 */
export const forgotPassword = async (req, res) => {
	try {
		const { email } = req.body;

		// 查找用户
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(404).json({
				success: false,
				message: "没有找到使用此邮箱的用户",
			});
		}

		// 生成重置令牌
		const resetToken = crypto.randomBytes(32).toString("hex");

		// 设置令牌过期时间（1小时）
		user.resetPasswordToken = resetToken;
		user.resetPasswordExpires = Date.now() + 3600000; // 1小时
		await user.save();

		// 构建重置链接
		const resetUrl = `${req.protocol}://${req.get(
			"host"
		)}/reset-password/${resetToken}`;

		// 发送重置邮件
		await sendEmail({
			to: user.email,
			subject: "密码重置",
			text: `您请求重置密码。请点击以下链接重置您的密码: ${resetUrl}\n\n如果您没有请求重置密码，请忽略此邮件。`,
		});

		res.status(200).json({
			success: true,
			message: "重置密码邮件已发送",
		});
	} catch (error) {
		logger.error(`忘记密码流程失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，无法发送重置邮件",
		});
	}
};

/**
 * 重置密码
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 密码重置的结果
 */
export const resetPassword = async (req, res) => {
	try {
		const { token, newPassword } = req.body;

		// 查找拥有该令牌且未过期的用户
		const user = await User.findOne({
			resetPasswordToken: token,
			resetPasswordExpires: { $gt: Date.now() },
		});

		if (!user) {
			return res.status(400).json({
				success: false,
				message: "无效或过期的密码重置令牌",
			});
		}

		// 加密新密码
		const salt = await bcrypt.genSalt(10);
		user.password = await bcrypt.hash(newPassword, salt);

		// 清除重置令牌字段
		user.resetPasswordToken = undefined;
		user.resetPasswordExpires = undefined;

		await user.save();

		res.status(200).json({
			success: true,
			message: "密码重置成功",
		});
	} catch (error) {
		logger.error(`重置密码失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，密码重置失败",
		});
	}
};

/**
 * 获取当前用户信息
 * @async
 * @param {Object} req - Express 请求对象
 * @param {Object} res - Express 响应对象
 * @returns {Object} 当前用户的信息
 */
export const getCurrentUser = async (req, res) => {
	try {
		// req.user 是在认证中间件中设置的
		const user = await User.findById(req.user.id).select("-password -__v");

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "用户不存在",
			});
		}

		res.status(200).json({
			success: true,
			data: { user },
		});
	} catch (error) {
		logger.error(`获取当前用户信息失败: ${error.message}`);
		res.status(500).json({
			success: false,
			message: "服务器错误，无法获取用户信息",
		});
	}
};

/**
 * 生成访问令牌
 * @private
 * @param {string} userId - 用户ID
 * @returns {string} JWT访问令牌
 */
const generateAccessToken = (userId) => {
	return jwt.sign({ id: userId }, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	});
};

/**
 * 生成刷新令牌
 * @private
 * @param {string} userId - 用户ID
 * @returns {string} JWT刷新令牌
 */
const generateRefreshToken = (userId) => {
	return jwt.sign({ id: userId }, JWT_SECRET, {
		expiresIn: JWT_REFRESH_EXPIRES_IN,
	});
};
