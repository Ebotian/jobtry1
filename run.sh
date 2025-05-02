#!/bin/bash

set -e

echo "=== 1. 配置环境变量 ==="
cd backend
if [ ! -f .env ]; then
    if [ -f env ]; then
        cp env .env
        echo "已复制 env 为 .env，请根据需要修改 .env 文件中的配置。"
    else
        echo "未找到 env 文件，请手动创建 .env。"
    fi
else
    echo ".env 已存在，跳过复制。"
fi
cd ..

echo "=== 2. 安装 concurrently 工具 ==="
npm install concurrently --save-dev

echo "注意你必须配置好 .env 文件中的API，才能正常使用ai助手。"
echo ".env文件位置:backend/.env"

read -p "请确认已配置好 .env 文件，是否继续启动？(y/N): " confirm
confirm=${confirm:-N}
if [[ ! "$confirm" =~ ^[Yy]$ ]]; then
    echo "已取消启动。请先配置好 .env 文件。"
    exit 1
fi

echo "=== 3. 一键启动前后端（输出合并，Ctrl+C 可全部停止）==="
npx concurrently -k -n BACKEND,FRONTEND -c yellow,cyan \
  "cd backend && npm install && node app.js" \
  "cd frontend && npm install && npm run dev"