import mongoose from "mongoose";
import Task from "./models/taskModel.js";
import "./loadEnv.js";

// 新增结果模型
const resultSchema = new mongoose.Schema({
	config: Object,
	result: Object,
	createdAt: { type: Date, default: Date.now },
});
const TaskResult =
	mongoose.models.TaskResult || mongoose.model("TaskResult", resultSchema);

await mongoose.connect(process.env.MONGODB_URI);
await Task.deleteMany({});
await TaskResult.deleteMany({});
console.log("已清空所有任务和历史结果");
await mongoose.disconnect();
