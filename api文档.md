## 后端 API 文档

### 接口基础路径

- 所有任务相关接口前缀：`/api/tasks`

---

### 1. 创建/更新任务配置

POST `/api/tasks/config`

请求体 (JSON)：

```json
{
	"name": "<站点>-<关键词>",
	"config": {
		/* 任务配置对象 */
	},
	"enableScheduler": true // 是否开启定时任务
}
```

响应：新创建或更新后的任务对象

---

### 2. 查询所有任务

GET `/api/tasks`

响应：任务配置列表

---

### 3. 查询单个任务

GET `/api/tasks/:id`

参数：

- `id`：任务 ID

响应：指定任务的配置和当前状态

---

### 4. 启动/停止任务

POST `/api/tasks/:id/start`

POST `/api/tasks/:id/stop`

参数：

- `id`：任务 ID

响应：操作结果状态 `{ success: true }`

---

### 5. 立即执行一次任务

POST `/api/tasks/:id/execute`

参数：

- `id`：任务 ID

响应：本次执行结果对象

---

### 6. 查询任务结果

GET `/api/tasks/:id/result`

参数：

- `id`：任务 ID

响应：指定 ID 的最新一次执行结果

---

### 7. 查询所有历史结果

GET `/api/tasks/results`

响应：所有任务的历史执行结果列表

---

### 8. 查询最新一次执行结果

GET `/api/tasks/results/latest`

响应：最近一次执行结果对象

---

### 9. AI 聊天接口

POST `/api/tasks/chat`

请求体 (JSON)：

```json
{
	"context": {
		/* 当前上下文，如历史摘要 */
	},
	"input": "用户输入的问题"
}
```

响应：

```json
{ "reply": "AI 助手回复内容" }
```

---

> 备注：以上所有接口均返回标准的 HTTP 状态码和 JSON 格式数据，开发时可根据需要在前端调用对应接口，详见 `frontend/src/components/api/taskService.js`。
