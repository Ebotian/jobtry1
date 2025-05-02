import mongoose from "mongoose";

const TaskSchema = new mongoose.Schema({
	name: { type: String, required: true, unique: true }, // 任务名称
	config: { type: Object, required: true }, // 任务参数配置（如站点、关键词、定时等）
	status: {
		type: String,
		enum: ["pending", "running", "stopped"],
		default: "pending",
	},
	result: { type: Object }, // AI分析结构化结果
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now },
	cron: { type: String, default: "0 * * * *" }, // 定时表达式，默认每小时
	enableScheduler: { type: Boolean, default: true }, // 定时任务开关
});

TaskSchema.pre("save", function (next) {
	this.updatedAt = Date.now();
	next();
});

const Task = mongoose.model("Task", TaskSchema);
export default Task;
