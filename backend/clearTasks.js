import mongoose from "mongoose";
import Task from "./models/taskModel.js";
import "./loadEnv.js";

await mongoose.connect(process.env.MONGODB_URI);
await Task.deleteMany({});
console.log("已清空所有任务");
await mongoose.disconnect();