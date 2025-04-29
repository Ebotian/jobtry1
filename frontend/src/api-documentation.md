# API Documentation

This document provides comprehensive documentation for all available API endpoints in the backend. Frontend developers can use this as a reference when integrating with backend services.

---

# AI 智能服务接口（AI Service Endpoints）

本节介绍与 AI 相关的所有接口，包括智能聊天、文本摘要、情感分析和主题提取。

---

## 1. 聊天接口 / Chat API

**Endpoint:** `POST /api/ai/chat`

**描述（Description）：**

- 与 AI 进行对话，支持上下文历史。
- Chat with AI, supporting context history.

**请求体（Request Body）：**

```json
{
	"message": "string (required)", // 当前用户输入 Current user message
	"history": [
		// 聊天历史（可选）Chat history (optional)
		{ "role": "user|assistant", "content": "string" }
	]
}
```

**响应体（Response Body）：**
返回 OpenAI/DeepSeek 标准格式。
Returns standard OpenAI/DeepSeek format.

```json
{
	"id": "chatcmpl-xxx",
	"object": "chat.completion",
	"created": 1714380000,
	"model": "deepseek-chat",
	"choices": [
		{
			"index": 0,
			"message": {
				"role": "assistant",
				"content": "AI 回复内容..."
			},
			"finish_reason": "stop"
		}
	],
	"usage": {
		"prompt_tokens": 30,
		"completion_tokens": 50,
		"total_tokens": 80
	}
}
```

**错误响应（Error Response）：**

```json
{
	"error": { "message": "AI 聊天错误: ..." }
}
```

---

## 2. 文本摘要接口 / Summarization API

**Endpoint:** `POST /api/ai/summarize`

**描述（Description）：**

- 对输入文本生成简洁摘要。
- Generate a concise summary for the input text.

**请求体（Request Body）：**

```json
{
	"text": "string (required)",
	"options": {
		/* 可选参数 optional */
	}
}
```

**响应体（Response Body）：**

```json
{
	"summary": "string"
}
```

---

## 3. 情感分析接口 / Sentiment Analysis API

**Endpoint:** `POST /api/ai/sentiment`

**描述（Description）：**

- 对文本进行情感分析，返回情感类型和分数。
- Analyze sentiment of the text, returns type and score.

**请求体（Request Body）：**

```json
{
	"text": "string (required)"
}
```

**响应体（Response Body）：**

```json
{
	"sentiment": "积极|消极|中性 (positive|negative|neutral)",
	"score": 0.85,
	"details": "详细分析..."
}
```

---

## 4. 主题提取接口 / Topic Extraction API

**Endpoint:** `POST /api/ai/topics`

**描述（Description）：**

- 提取文本中的主题关键词。
- Extract main topics/keywords from text.

**请求体（Request Body）：**

```json
{
	"text": "string (required)",
	"topN": 5 // 可选，返回主题数量 Optional, number of topics
}
```

**响应体（Response Body）：**

```json
{
  "topics": ["主题1", "主题2", ...]
}
```

---

## 通用错误响应（General Error Response）

所有 AI 接口错误返回如下格式：
All AI endpoints return errors in this format:

```json
{
	"error": {
		"message": "错误描述 Error description"
	}
}
```

---

> **注意（Note）：**
> 所有 AI 接口均为 RESTful，除 /summarize、/sentiment、/topics 需登录外，/chat 可公开访问。
> All AI endpoints are RESTful. /summarize, /sentiment, /topics require authentication, /chat is public.

---

## Base URL

All API requests are prefixed with `/api`.

## Authentication

### Authentication Endpoints

| Method | Endpoint                | Description                        |
| ------ | ----------------------- | ---------------------------------- |
| POST   | `/auth/register`        | Register a new user                |
| POST   | `/auth/login`           | Login and get authentication token |
| POST   | `/auth/logout`          | Log out and invalidate token       |
| POST   | `/auth/refresh`         | Refresh authentication token       |
| POST   | `/auth/forgot-password` | Request password reset             |
| POST   | `/auth/reset-password`  | Reset password with token          |
| GET    | `/auth/profile`         | Get user profile                   |
| PUT    | `/auth/profile`         | Update user profile                |
| GET    | `/auth/verify/:token`   | Verify email with token            |

### Registration

**Endpoint:** `POST /api/auth/register`

**Description:** Register a new user account

**Request Body:**

```json
{
	"username": "string (required)",
	"email": "string (required)",
	"password": "string (required)",
	"confirmPassword": "string (required)"
}
```

**Responses:**

- `201 Created`: Registration successful
- `400 Bad Request`: Invalid input data
- `409 Conflict`: Username or email already in use
- `500 Server Error`: Server error

### Login

**Endpoint:** `POST /api/auth/login`

**Description:** Authenticate user and get access token

**Request Body:**

```json
{
	"email": "string (required)",
	"password": "string (required)"
}
```

**Response:**

```json
{
	"token": "JWT token",
	"user": {
		"id": "string",
		"username": "string",
		"email": "string",
		"role": "string"
	}
}
```

**Responses:**

- `200 OK`: Login successful
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Invalid credentials
- `500 Server Error`: Server error

### Logout

**Endpoint:** `POST /api/auth/logout`

**Description:** Invalidate the current authentication token

**Headers:**

- `Authorization: Bearer {token}`

**Responses:**

- `200 OK`: Logout successful
- `401 Unauthorized`: Not authenticated
- `500 Server Error`: Server error

### Refresh Token

**Endpoint:** `POST /api/auth/refresh`

**Description:** Get a new access token using refresh token

**Headers:**

- `Authorization: Bearer {refresh_token}`

**Responses:**

- `200 OK`: New token issued
- `401 Unauthorized`: Invalid refresh token
- `500 Server Error`: Server error

### Forgot Password

**Endpoint:** `POST /api/auth/forgot-password`

**Description:** Request a password reset link

**Request Body:**

```json
{
	"email": "string (required)"
}
```

**Responses:**

- `200 OK`: Reset email sent
- `400 Bad Request`: Invalid email
- `404 Not Found`: Email not found
- `500 Server Error`: Server error

### Reset Password

**Endpoint:** `POST /api/auth/reset-password`

**Description:** Reset password using reset token

**Request Body:**

```json
{
	"token": "string (required)",
	"password": "string (required)",
	"confirmPassword": "string (required)"
}
```

**Responses:**

- `200 OK`: Password reset successful
- `400 Bad Request`: Invalid input data or passwords don't match
- `401 Unauthorized`: Invalid or expired token
- `500 Server Error`: Server error

### Get User Profile

**Endpoint:** `GET /api/auth/profile`

**Description:** Get the current user's profile information

**Headers:**

- `Authorization: Bearer {token}`

**Responses:**

- `200 OK`: Profile data returned
- `401 Unauthorized`: Not authenticated
- `500 Server Error`: Server error

### Update User Profile

**Endpoint:** `PUT /api/auth/profile`

**Description:** Update the current user's profile information

**Headers:**

- `Authorization: Bearer {token}`

**Request Body:**

```json
{
	"username": "string (optional)",
	"email": "string (optional)",
	"password": "string (optional)",
	"newPassword": "string (optional)"
}
```

**Responses:**

- `200 OK`: Profile updated
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `500 Server Error`: Server error

### Verify Email

**Endpoint:** `GET /api/auth/verify/:token`

**Description:** Verify user email with token

**Parameters:**

- `token`: Verification token sent to user's email

**Responses:**

- `200 OK`: Email verified successfully
- `400 Bad Request`: Invalid token
- `500 Server Error`: Server error

## Task Management

### Task Endpoints

| Method | Endpoint             | Description               |
| ------ | -------------------- | ------------------------- |
| GET    | `/tasks`             | Get all tasks             |
| POST   | `/tasks`             | Create a new task         |
| GET    | `/tasks/:id`         | Get a specific task by ID |
| PUT    | `/tasks/:id`         | Update a task             |
| DELETE | `/tasks/:id`         | Delete a task             |
| POST   | `/tasks/:id/start`   | Start a task              |
| POST   | `/tasks/:id/stop`    | Stop a task               |
| GET    | `/tasks/:id/results` | Get results for a task    |

### Get All Tasks

**Endpoint:** `GET /api/tasks`

**Description:** Get a list of all tasks for the authenticated user

**Headers:**

- `Authorization: Bearer {token}`

**Responses:**

- `200 OK`: List of tasks returned
- `401 Unauthorized`: Not authenticated
- `500 Server Error`: Server error

### Create Task

**Endpoint:** `POST /api/tasks`

**Description:** Create a new monitoring task

**Headers:**

- `Authorization: Bearer {token}`

**Request Body:**

```json
{
	"keywords": "string (required)",
	"interval": "number (required, in minutes)",
	"source": "string (optional, e.g., '微博', '新闻')"
}
```

**Responses:**

- `201 Created`: Task created successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `500 Server Error`: Server error

### Get Task by ID

**Endpoint:** `GET /api/tasks/:id`

**Description:** Get details of a specific task

**Headers:**

- `Authorization: Bearer {token}`

**Parameters:**

- `id`: Task ID

**Responses:**

- `200 OK`: Task details returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Server Error`: Server error

### Update Task

**Endpoint:** `PUT /api/tasks/:id`

**Description:** Update an existing task

**Headers:**

- `Authorization: Bearer {token}`

**Parameters:**

- `id`: Task ID

**Request Body:**

```json
{
	"keywords": "string (optional)",
	"interval": "number (optional, in minutes)",
	"source": "string (optional)"
}
```

**Responses:**

- `200 OK`: Task updated successfully
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Server Error`: Server error

### Delete Task

**Endpoint:** `DELETE /api/tasks/:id`

**Description:** Delete a specific task

**Headers:**

- `Authorization: Bearer {token}`

**Parameters:**

- `id`: Task ID

**Responses:**

- `200 OK`: Task deleted successfully
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Server Error`: Server error

### Start Task

**Endpoint:** `POST /api/tasks/:id/start`

**Description:** Start a monitoring task

**Headers:**

- `Authorization: Bearer {token}`

**Parameters:**

- `id`: Task ID

**Responses:**

- `200 OK`: Task started successfully
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Server Error`: Server error

### Stop Task

**Endpoint:** `POST /api/tasks/:id/stop`

**Description:** Stop a running monitoring task

**Headers:**

- `Authorization: Bearer {token}`

**Parameters:**

- `id`: Task ID

**Responses:**

- `200 OK`: Task stopped successfully
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Server Error`: Server error

### Get Task Results

**Endpoint:** `GET /api/tasks/:id/results`

**Description:** Get monitoring results for a specific task

**Headers:**

- `Authorization: Bearer {token}`

**Parameters:**

- `id`: Task ID

**Query Parameters:**

- `page`: Page number for pagination (default: 1)
- `limit`: Number of results per page (default: 10)
- `sortBy`: Field to sort by (default: createdAt)
- `order`: Sort order, 'asc' or 'desc' (default: desc)

**Responses:**

- `200 OK`: Task results returned
- `401 Unauthorized`: Not authenticated
- `404 Not Found`: Task not found
- `500 Server Error`: Server error

## Error Responses

All API endpoints may return the following error responses:

```json
{
	"error": {
		"message": "Error description",
		"code": "ERROR_CODE",
		"status": 400
	}
}
```

Common error codes include:

- `VALIDATION_ERROR`: Invalid input data
- `AUTHENTICATION_ERROR`: Authentication failure
- `NOT_FOUND`: Resource not found
- `PERMISSION_DENIED`: User lacks permission
- `SERVER_ERROR`: Internal server error
