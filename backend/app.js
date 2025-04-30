import dotenv from "dotenv";
dotenv.config();
import express from "express";
import "./config/db.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 路由注册
app.use("/api/tasks", taskRoutes);

// 404 处理
app.use((req, res, next) => {
	res.status(404).json({ message: "Not Found" });
});

// 全局错误处理
app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({ message: "Server Error" });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});

export default app;
