/**
 * 任务模型
 * 负责定义爬虫任务数据结构和方法
 */

import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "请提供任务标题"],
			trim: true,
			maxlength: [100, "标题不能超过100个字符"],
		},
		description: {
			type: String,
			trim: true,
			maxlength: [1000, "描述不能超过1000个字符"],
		},
		url: {
			type: String,
			required: [true, "请提供目标URL"],
			trim: true,
			match: [
				/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w.-]*)*\/?$/,
				"请提供有效的URL",
			],
		},
		status: {
			type: String,
			enum: {
				values: ["pending", "processing", "completed", "failed", "cancelled"],
				message:
					"状态必须是: pending, processing, completed, failed, cancelled",
			},
			default: "pending",
		},
		priority: {
			type: String,
			enum: {
				values: ["low", "medium", "high"],
				message: "优先级必须是: low, medium, high",
			},
			default: "medium",
		},
		scheduledFor: {
			type: Date,
			default: Date.now,
		},
		tags: [
			{
				type: String,
				trim: true,
				maxlength: [20, "标签不能超过20个字符"],
			},
		],
		options: {
			depth: {
				type: Number,
				min: [1, "爬取深度至少为1"],
				max: [10, "爬取深度最大为10"],
				default: 3,
			},
			maxUrls: {
				type: Number,
				min: [1, "最大URL数至少为1"],
				max: [1000, "最大URL数最大为1000"],
				default: 100,
			},
			aiPrompt: {
				type: String,
				trim: true,
				maxlength: [500, "AI提示不能超过500个字符"],
			},
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "任务必须关联用户"],
		},
		result: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Result",
		},
		startedAt: {
			type: Date,
		},
		completedAt: {
			type: Date,
		},
		failedAt: {
			type: Date,
		},
		errorDetails: {
			type: String,
		},
	},
	{
		timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// 索引设置，提高查询性能
TaskSchema.index({ user: 1, createdAt: -1 });
TaskSchema.index({ status: 1, scheduledFor: 1 });
TaskSchema.index({ priority: 1 });
TaskSchema.index({ tags: 1 });

/**
 * 虚拟属性: 是否已过期
 */
TaskSchema.virtual("isExpired").get(function () {
	if (this.status !== "pending" && this.status !== "processing") {
		return false;
	}

	const now = new Date();
	const expirationTime = new Date(this.createdAt);
	expirationTime.setDate(expirationTime.getDate() + 7); // 假设7天过期

	return now > expirationTime;
});

/**
 * 虚拟属性: 任务持续时间（毫秒）
 */
TaskSchema.virtual("duration").get(function () {
	if (!this.startedAt || !this.completedAt) {
		return null;
	}

	return this.completedAt.getTime() - this.startedAt.getTime();
});

/**
 * 中间件: 查询前的钩子
 */
TaskSchema.pre(/^find/, function (next) {
	// 默认关联用户信息
	this.populate({
		path: "user",
		select: "name email",
	});

	next();
});

/**
 * 方法: 检查任务是否已调度
 * @returns {Boolean} 是否已调度
 */
TaskSchema.methods.isScheduled = function () {
	return this.status === "pending" && this.scheduledFor > new Date();
};

/**
 * 方法: 检查任务是否等待中
 * @returns {Boolean} 是否等待中
 */
TaskSchema.methods.isPending = function () {
	return this.status === "pending";
};

/**
 * 方法: 获取状态的文本描述
 * @returns {String} 状态文本
 */
TaskSchema.methods.getStatusText = function () {
	const statusMap = {
		pending: "等待中",
		processing: "处理中",
		completed: "已完成",
		failed: "失败",
		cancelled: "已取消",
	};

	return statusMap[this.status] || this.status;
};

/**
 * 方法: 获取优先级的文本描述
 * @returns {String} 优先级文本
 */
TaskSchema.methods.getPriorityText = function () {
	const priorityMap = {
		low: "低",
		medium: "中",
		high: "高",
	};

	return priorityMap[this.priority] || this.priority;
};

/**
 * 方法: 更新任务状态
 * @param {String} status - 新状态
 * @param {Object} details - 状态相关详情
 * @returns {Promise} 更新后的任务
 */
TaskSchema.methods.updateStatus = async function (status, details = {}) {
	this.status = status;

	switch (status) {
		case "processing":
			this.startedAt = new Date();
			break;
		case "completed":
			this.completedAt = new Date();
			break;
		case "failed":
			this.failedAt = new Date();
			if (details.error) {
				this.errorDetails = details.error.toString();
			}
			break;
	}

	return this.save();
};

/**
 * 静态方法: 查找即将执行的任务
 * @param {Number} limit - 限制条数
 * @returns {Promise<Task[]>} 任务列表
 */
TaskSchema.statics.findTasksDue = async function (limit = 10) {
	const now = new Date();

	return this.find({
		status: "pending",
		scheduledFor: { $lte: now },
	})
		.sort({ priority: -1, scheduledFor: 1 })
		.limit(limit);
};

/**
 * 静态方法: 获取任务统计
 * @param {String} userId - 用户ID (可选)
 * @returns {Promise<Object>} 统计数据
 */
TaskSchema.statics.getStats = async function (userId = null) {
	const match = userId ? { user: new mongoose.Types.ObjectId(userId) } : {};

	const stats = await this.aggregate([
		{ $match: match },
		{
			$group: {
				_id: "$status",
				count: { $sum: 1 },
			},
		},
	]);

	// 将结果转换为对象
	const result = {
		pending: 0,
		processing: 0,
		completed: 0,
		failed: 0,
		cancelled: 0,
		total: 0,
	};

	stats.forEach((item) => {
		result[item._id] = item.count;
		result.total += item.count;
	});

	return result;
};

// 创建模型
const Task = mongoose.model("Task", TaskSchema);

export default Task;
