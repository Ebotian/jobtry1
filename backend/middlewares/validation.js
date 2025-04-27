/**
 * 数据验证中间件
 * 使用Joi库实现请求数据验证
 */

import Joi from "joi";
import { AppError } from "./errorHandler.js";
import { logger } from "../utils/logger.js";

/**
 * 创建通用验证中间件
 * @param {Object} schema - Joi验证模式
 * @param {string} source - 验证的数据源 ('body', 'query', 'params')
 * @returns {Function} Express中间件函数
 */
export const validate = (schema, source = "body") => {
	return (req, res, next) => {
		// 获取要验证的数据
		const data = req[source];

		// 执行验证
		const { error, value } = schema.validate(data, {
			abortEarly: false, // 返回所有错误
			stripUnknown: true, // 删除未知字段
			errors: {
				wrap: { label: "" }, // 不包装错误标签
			},
		});

		// 验证失败
		if (error) {
			// 提取错误消息
			const errorMessages = error.details
				.map((detail) => detail.message)
				.join("; ");

			// 记录验证错误
			logger.warn(`请求验证失败: ${errorMessages}`, {
				path: req.path,
				method: req.method,
				[source]: data,
			});

			return next(new AppError(errorMessages, 400));
		}

		// 将经过验证和净化的数据重新分配给请求对象
		req[source] = value;
		return next();
	};
};

/**
 * 用户验证规则
 */
export const userValidation = {
	/**
	 * 用户注册验证规则
	 */
	register: Joi.object({
		name: Joi.string().trim().min(2).max(50).required().messages({
			"string.base": "姓名必须是字符串",
			"string.empty": "姓名不能为空",
			"string.min": "姓名至少需要2个字符",
			"string.max": "姓名不能超过50个字符",
			"any.required": "姓名字段为必填项",
		}),

		email: Joi.string().trim().email().required().messages({
			"string.base": "邮箱必须是字符串",
			"string.empty": "邮箱不能为空",
			"string.email": "邮箱格式无效",
			"any.required": "邮箱字段为必填项",
		}),

		password: Joi.string()
			.min(6)
			.max(30)
			.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
			.required()
			.messages({
				"string.base": "密码必须是字符串",
				"string.empty": "密码不能为空",
				"string.min": "密码至少需要6个字符",
				"string.max": "密码不能超过30个字符",
				"string.pattern.base":
					"密码必须包含至少一个小写字母、一个大写字母和一个数字",
				"any.required": "密码字段为必填项",
			}),

		passwordConfirm: Joi.string()
			.valid(Joi.ref("password"))
			.required()
			.messages({
				"string.base": "确认密码必须是字符串",
				"any.only": "确认密码必须与密码匹配",
				"any.required": "确认密码字段为必填项",
			}),

		role: Joi.string().valid("user", "admin").default("user").messages({
			"string.base": "角色必须是字符串",
			"any.only": "角色只能是 user 或 admin",
		}),
	}),

	/**
	 * 用户登录验证规则
	 */
	login: Joi.object({
		email: Joi.string().trim().email().required().messages({
			"string.base": "邮箱必须是字符串",
			"string.empty": "邮箱不能为空",
			"string.email": "邮箱格式无效",
			"any.required": "邮箱字段为必填项",
		}),

		password: Joi.string().required().messages({
			"string.base": "密码必须是字符串",
			"string.empty": "密码不能为空",
			"any.required": "密码字段为必填项",
		}),
	}),

	/**
	 * 更新用户信息验证规则
	 */
	updateUser: Joi.object({
		name: Joi.string().trim().min(2).max(50).messages({
			"string.base": "姓名必须是字符串",
			"string.min": "姓名至少需要2个字符",
			"string.max": "姓名不能超过50个字符",
		}),

		email: Joi.string().trim().email().messages({
			"string.base": "邮箱必须是字符串",
			"string.email": "邮箱格式无效",
		}),
	}),

	/**
	 * 更新密码验证规则
	 */
	updatePassword: Joi.object({
		currentPassword: Joi.string().required().messages({
			"string.base": "当前密码必须是字符串",
			"string.empty": "当前密码不能为空",
			"any.required": "当前密码字段为必填项",
		}),

		password: Joi.string()
			.min(6)
			.max(30)
			.pattern(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])"))
			.required()
			.messages({
				"string.base": "新密码必须是字符串",
				"string.empty": "新密码不能为空",
				"string.min": "新密码至少需要6个字符",
				"string.max": "新密码不能超过30个字符",
				"string.pattern.base":
					"新密码必须包含至少一个小写字母、一个大写字母和一个数字",
				"any.required": "新密码字段为必填项",
			}),

		passwordConfirm: Joi.string()
			.valid(Joi.ref("password"))
			.required()
			.messages({
				"string.base": "确认密码必须是字符串",
				"any.only": "确认密码必须与新密码匹配",
				"any.required": "确认密码字段为必填项",
			}),
	}),
};

/**
 * 任务验证规则
 */
export const taskValidation = {
	/**
	 * 创建任务验证规则
	 */
	createTask: Joi.object({
		title: Joi.string().trim().min(3).max(100).required().messages({
			"string.base": "标题必须是字符串",
			"string.empty": "标题不能为空",
			"string.min": "标题至少需要3个字符",
			"string.max": "标题不能超过100个字符",
			"any.required": "标题字段为必填项",
		}),

		description: Joi.string().trim().max(1000).messages({
			"string.base": "描述必须是字符串",
			"string.max": "描述不能超过1000个字符",
		}),

		url: Joi.string().trim().uri().required().messages({
			"string.base": "URL必须是字符串",
			"string.empty": "URL不能为空",
			"string.uri": "URL格式无效",
			"any.required": "URL字段为必填项",
		}),

		scheduledFor: Joi.date().min("now").messages({
			"date.base": "计划执行时间必须是有效日期",
			"date.min": "计划执行时间不能是过去的时间",
		}),

		priority: Joi.string()
			.valid("low", "medium", "high")
			.default("medium")
			.messages({
				"string.base": "优先级必须是字符串",
				"any.only": "优先级只能是 low、medium 或 high",
			}),

		tags: Joi.array().items(Joi.string().trim().min(1).max(20)).messages({
			"array.base": "标签必须是数组",
		}),

		options: Joi.object({
			depth: Joi.number().integer().min(1).max(10).default(3).messages({
				"number.base": "爬取深度必须是数字",
				"number.integer": "爬取深度必须是整数",
				"number.min": "爬取深度至少为1",
				"number.max": "爬取深度最大为10",
			}),

			maxUrls: Joi.number().integer().min(1).max(1000).default(100).messages({
				"number.base": "最大URL数必须是数字",
				"number.integer": "最大URL数必须是整数",
				"number.min": "最大URL数至少为1",
				"number.max": "最大URL数最大为1000",
			}),

			aiPrompt: Joi.string().trim().max(500).messages({
				"string.base": "AI提示必须是字符串",
				"string.max": "AI提示不能超过500个字符",
			}),
		}),
	}),

	/**
	 * 更新任务验证规则
	 */
	updateTask: Joi.object({
		title: Joi.string().trim().min(3).max(100).messages({
			"string.base": "标题必须是字符串",
			"string.min": "标题至少需要3个字符",
			"string.max": "标题不能超过100个字符",
		}),

		description: Joi.string().trim().max(1000).messages({
			"string.base": "描述必须是字符串",
			"string.max": "描述不能超过1000个字符",
		}),

		url: Joi.string().trim().uri().messages({
			"string.base": "URL必须是字符串",
			"string.uri": "URL格式无效",
		}),

		scheduledFor: Joi.date().min("now").messages({
			"date.base": "计划执行时间必须是有效日期",
			"date.min": "计划执行时间不能是过去的时间",
		}),

		status: Joi.string()
			.valid("pending", "processing", "completed", "failed", "cancelled")
			.messages({
				"string.base": "状态必须是字符串",
				"any.only":
					"状态只能是 pending、processing、completed、failed 或 cancelled",
			}),

		priority: Joi.string().valid("low", "medium", "high").messages({
			"string.base": "优先级必须是字符串",
			"any.only": "优先级只能是 low、medium 或 high",
		}),

		tags: Joi.array().items(Joi.string().trim().min(1).max(20)).messages({
			"array.base": "标签必须是数组",
		}),

		options: Joi.object({
			depth: Joi.number().integer().min(1).max(10).messages({
				"number.base": "爬取深度必须是数字",
				"number.integer": "爬取深度必须是整数",
				"number.min": "爬取深度至少为1",
				"number.max": "爬取深度最大为10",
			}),

			maxUrls: Joi.number().integer().min(1).max(1000).messages({
				"number.base": "最大URL数必须是数字",
				"number.integer": "最大URL数必须是整数",
				"number.min": "最大URL数至少为1",
				"number.max": "最大URL数最大为1000",
			}),

			aiPrompt: Joi.string().trim().max(500).messages({
				"string.base": "AI提示必须是字符串",
				"string.max": "AI提示不能超过500个字符",
			}),
		}),
	}),

	/**
	 * 查询任务验证规则
	 */
	queryTasks: Joi.object({
		page: Joi.number().integer().min(1).default(1).messages({
			"number.base": "页码必须是数字",
			"number.integer": "页码必须是整数",
			"number.min": "页码至少为1",
		}),

		limit: Joi.number().integer().min(1).max(100).default(10).messages({
			"number.base": "每页数量必须是数字",
			"number.integer": "每页数量必须是整数",
			"number.min": "每页数量至少为1",
			"number.max": "每页数量最大为100",
		}),

		status: Joi.string()
			.valid("pending", "processing", "completed", "failed", "cancelled", "all")
			.messages({
				"string.base": "状态必须是字符串",
				"any.only":
					"状态只能是 pending、processing、completed、failed、cancelled 或 all",
			}),

		priority: Joi.string().valid("low", "medium", "high", "all").messages({
			"string.base": "优先级必须是字符串",
			"any.only": "优先级只能是 low、medium、high 或 all",
		}),

		sortBy: Joi.string()
			.valid("createdAt", "scheduledFor", "priority", "title")
			.default("createdAt")
			.messages({
				"string.base": "排序字段必须是字符串",
				"any.only": "排序字段只能是 createdAt、scheduledFor、priority 或 title",
			}),

		sortOrder: Joi.string().valid("asc", "desc").default("desc").messages({
			"string.base": "排序顺序必须是字符串",
			"any.only": "排序顺序只能是 asc 或 desc",
		}),

		search: Joi.string().trim().max(50).allow("").messages({
			"string.base": "搜索词必须是字符串",
			"string.max": "搜索词不能超过50个字符",
		}),
	}),
};

export default {
	validate,
	userValidation,
	taskValidation,
};
