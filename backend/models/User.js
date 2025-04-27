/**
 * 用户模型
 * 负责定义用户数据结构和方法
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import config from "../config/env.js";

const UserSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, "请提供姓名"],
			trim: true,
			maxlength: [50, "姓名不能超过50个字符"],
		},
		email: {
			type: String,
			required: [true, "请提供电子邮箱"],
			unique: true,
			match: [
				/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
				"请提供有效的电子邮箱",
			],
			lowercase: true,
			trim: true,
		},
		password: {
			type: String,
			required: [true, "请提供密码"],
			minlength: [6, "密码至少需要6个字符"],
			select: false, // 查询时默认不返回密码
		},
		role: {
			type: String,
			enum: ["user", "admin"],
			default: "user",
		},
		passwordChangedAt: Date,
		resetPasswordToken: String,
		resetPasswordExpire: Date,
	},
	{
		timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
		toJSON: { virtuals: true }, // 在JSON中包含虚拟属性
		toObject: { virtuals: true }, // 在对象中包含虚拟属性
	}
);

// 虚拟属性: 任务计数
UserSchema.virtual("taskCount", {
	ref: "Task",
	localField: "_id",
	foreignField: "user",
	count: true,
});

/**
 * 中间件: 保存前对密码进行加密
 */
UserSchema.pre("save", async function (next) {
	// 如果密码没有被修改，则跳过加密
	if (!this.isModified("password")) {
		return next();
	}

	try {
		// 生成盐值并加密密码
		const salt = await bcrypt.genSalt(10);
		this.password = await bcrypt.hash(this.password, salt);

		// 如果是更新密码，更新passwordChangedAt字段
		if (this.isModified("password") && !this.isNew) {
			this.passwordChangedAt = Date.now() - 1000; // 减去1秒以确保JWT在密码更改后颁发
		}

		next();
	} catch (error) {
		next(error);
	}
});

/**
 * 中间件: 删除用户时清理关联数据
 */
UserSchema.pre("remove", async function (next) {
	try {
		// 删除用户关联的所有任务
		await this.model("Task").deleteMany({ user: this._id });
		next();
	} catch (error) {
		next(error);
	}
});

/**
 * 方法: 验证密码
 * @param {string} enteredPassword - 用户输入的密码
 * @returns {Promise<boolean>} 密码是否匹配
 */
UserSchema.methods.matchPassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password);
};

/**
 * 方法: 生成JWT令牌
 * @returns {string} JWT令牌
 */
UserSchema.methods.getSignedJwtToken = function () {
	return jwt.sign({ id: this._id }, config.JWT_SECRET, {
		expiresIn: config.JWT_EXPIRE,
	});
};

/**
 * 方法: 生成并哈希密码重置令牌
 * @returns {string} 原始重置令牌
 */
UserSchema.methods.getResetPasswordToken = function () {
	// 生成令牌
	const resetToken = crypto.randomBytes(20).toString("hex");

	// 哈希令牌并设置到resetPasswordToken字段
	this.resetPasswordToken = crypto
		.createHash("sha256")
		.update(resetToken)
		.digest("hex");

	// 设置过期时间 (10分钟)
	this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

	return resetToken;
};

/**
 * 静态方法: 通过邮箱查找用户
 * @param {string} email - 用户邮箱
 * @returns {Promise<User>} 用户文档
 */
UserSchema.statics.findByEmail = async function (email) {
	return this.findOne({ email });
};

/**
 * 查询中间件: 查询前增加钩子
 */
UserSchema.pre(/^find/, function (next) {
	// 可以在这里添加通用的查询逻辑，比如过滤已删除的用户等
	next();
});

// 创建模型
const User = mongoose.model("User", UserSchema);

export default User;
