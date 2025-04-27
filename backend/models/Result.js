/**
 * 任务结果模型
 * 负责存储和管理爬虫任务的抓取结果和AI处理结果
 */

import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema(
	{
		title: {
			type: String,
			required: [true, "请提供结果标题"],
			trim: true,
			maxlength: [200, "标题不能超过200个字符"],
		},
		task: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Task",
			required: [true, "结果必须关联任务"],
		},
		user: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: [true, "结果必须关联用户"],
		},
		summary: {
			aiSummary: {
				type: String,
				trim: true,
			},
			keyPoints: [String],
			sentiment: {
				type: String,
				enum: ["positive", "neutral", "negative"],
				default: "neutral",
			},
			keywords: [String],
		},
		data: [
			{
				url: {
					type: String,
					required: true,
					trim: true,
				},
				title: {
					type: String,
					trim: true,
				},
				content: {
					type: String,
				},
				contentType: {
					type: String,
					enum: ["html", "text", "structured", "mixed"],
					default: "html",
				},
				depth: {
					type: Number,
					default: 0,
				},
				parentUrl: {
					type: String,
					trim: true,
				},
				statusCode: Number,
				headers: Object,
				error: String,
				downloadTime: Number,
				processTime: Number,
				crawledAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
		metadata: {
			totalUrls: {
				type: Number,
				default: 0,
			},
			successfulUrls: {
				type: Number,
				default: 0,
			},
			failedUrls: {
				type: Number,
				default: 0,
			},
			avgDownloadTime: Number,
			avgProcessTime: Number,
			startTime: Date,
			endTime: Date,
			totalTime: Number,
			userAgent: String,
			maxDepthReached: Number,
			requestStats: Object,
			errors: [
				{
					url: String,
					error: String,
					statusCode: Number,
				},
			],
		},
		contentType: {
			type: String,
			enum: ["html", "text", "structured", "mixed"],
			default: "mixed",
		},
		dataSizeBytes: {
			type: Number,
			default: 0,
		},
		processedAt: {
			type: Date,
		},
		aiProcessingDetails: {
			model: String,
			promptTokens: Number,
			completionTokens: Number,
			totalTokens: Number,
			processingTime: Number,
			error: String,
		},
	},
	{
		timestamps: true, // 自动添加 createdAt 和 updatedAt 字段
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	}
);

// 索引设置，提高查询性能
ResultSchema.index({ task: 1 });
ResultSchema.index({ user: 1, createdAt: -1 });
ResultSchema.index({ "data.url": 1 });

/**
 * 虚拟属性: 总字数
 */
ResultSchema.virtual("wordCount").get(function () {
	if (!this.data || !this.data.length) {
		return 0;
	}

	return this.data.reduce((total, item) => {
		if (!item.content) {
			return total;
		}
		// 简单计算单词数量（以空格分隔）
		const words = item.content
			.replace(/<[^>]*>?/gm, "") // 移除HTML标签
			.split(/\s+/)
			.filter((word) => word.length > 0);

		return total + words.length;
	}, 0);
});

/**
 * 虚拟属性: 是否有AI摘要
 */
ResultSchema.virtual("hasAiSummary").get(function () {
	return Boolean(
		this.summary &&
			this.summary.aiSummary &&
			this.summary.aiSummary.trim().length > 0
	);
});

/**
 * 中间件: 查询前的钩子
 */
ResultSchema.pre(/^find/, function (next) {
	// 默认关联任务和用户信息
	this.populate({
		path: "task",
		select: "title url status",
	}).populate({
		path: "user",
		select: "name email",
	});

	next();
});

/**
 * 中间件: 保存前计算数据大小
 */
ResultSchema.pre("save", function (next) {
	// 计算数据大小（字节）
	if (this.data && this.data.length) {
		this.dataSizeBytes = this.data.reduce((size, item) => {
			return (
				size + (item.content ? Buffer.byteLength(item.content, "utf8") : 0)
			);
		}, 0);
	}

	next();
});

/**
 * 方法: 获取字数统计
 * @returns {Number} 总字数
 */
ResultSchema.methods.getWordCount = function () {
	return this.wordCount;
};

/**
 * 方法: 获取结果统计信息
 * @returns {Object} 统计数据
 */
ResultSchema.methods.getStatistics = function () {
	const stats = {
		urls: {
			total: this.metadata?.totalUrls || 0,
			successful: this.metadata?.successfulUrls || 0,
			failed: this.metadata?.failedUrls || 0,
		},
		timing: {
			totalTime: this.metadata?.totalTime || 0,
			avgDownloadTime: this.metadata?.avgDownloadTime || 0,
			avgProcessTime: this.metadata?.avgProcessTime || 0,
		},
		content: {
			dataSizeBytes: this.dataSizeBytes || 0,
			dataSizeMB: (this.dataSizeBytes / (1024 * 1024)).toFixed(2),
			wordCount: this.getWordCount(),
			pageCount: this.data?.length || 0,
		},
		ai: {
			hasAiSummary: this.hasAiSummary,
			model: this.aiProcessingDetails?.model,
			totalTokens: this.aiProcessingDetails?.totalTokens,
			processingTime: this.aiProcessingDetails?.processingTime,
		},
	};

	return stats;
};

/**
 * 方法: 检查是否存在错误
 * @returns {Boolean} 是否有错误
 */
ResultSchema.methods.hasError = function () {
	return Boolean(
		(this.metadata &&
			this.metadata.errors &&
			this.metadata.errors.length > 0) ||
			(this.aiProcessingDetails && this.aiProcessingDetails.error)
	);
};

/**
 * 方法: 添加爬取数据
 * @param {Object} pageData - 页面数据
 */
ResultSchema.methods.addPageData = function (pageData) {
	if (!this.data) {
		this.data = [];
	}

	this.data.push(pageData);

	// 更新元数据
	if (!this.metadata) {
		this.metadata = {
			totalUrls: 0,
			successfulUrls: 0,
			failedUrls: 0,
			errors: [],
		};
	}

	this.metadata.totalUrls++;

	if (pageData.error) {
		this.metadata.failedUrls++;
		this.metadata.errors.push({
			url: pageData.url,
			error: pageData.error,
			statusCode: pageData.statusCode,
		});
	} else {
		this.metadata.successfulUrls++;
	}

	// 更新最大深度
	if (
		!this.metadata.maxDepthReached ||
		pageData.depth > this.metadata.maxDepthReached
	) {
		this.metadata.maxDepthReached = pageData.depth;
	}
};

/**
 * 方法: 更新AI处理信息
 * @param {Object} aiDetails - AI处理详情
 */
ResultSchema.methods.updateAiProcessing = function (aiDetails) {
	this.aiProcessingDetails = {
		...aiDetails,
		processingTime: aiDetails.processingTime || 0,
	};

	this.processedAt = new Date();
};

/**
 * 静态方法: 按用户ID查找结果
 * @param {String} userId - 用户ID
 * @param {Object} filters - 筛选条件
 * @param {Object} options - 选项（排序、分页等）
 * @returns {Promise<Result[]>} 结果列表
 */
ResultSchema.statics.findByUser = async function (
	userId,
	filters = {},
	options = {}
) {
	const query = {
		user: userId,
		...filters,
	};

	const { sort = { createdAt: -1 }, limit = 10, page = 1 } = options;

	return this.find(query)
		.sort(sort)
		.limit(limit)
		.skip((page - 1) * limit);
};

// 创建模型
const Result = mongoose.model("Result", ResultSchema);

export default Result;
