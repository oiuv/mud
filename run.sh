#!/bin/bash

# 定义变量
ENV_FILE="data/.env"
EXAMPLE_ENV_FILE="data/.env.example"
DRIVER_FILE="fluffos/build/bin/driver"
CONFIG_FILE="config.ini"

# 检查项目 data 目录中是否存在 .env 文件
if [ ! -f "$ENV_FILE" ]; then
  # 如果不存在，将 .env.example 复制为 .env
  cp "$EXAMPLE_ENV_FILE" "$ENV_FILE"
  echo "提示：请编辑 $ENV_FILE 配置你的游戏环境变量。"
fi

# 判断 driver 文件是否存在
if [ -f "$DRIVER_FILE" ]; then
    # 如果 driver 文件存在，则运行 driver config.cfg
    "$DRIVER_FILE" "$CONFIG_FILE"
else
    # 如果 driver 文件不存在，则提示请先运行 build.sh 编译 driver
    echo "请先运行 build.sh 编译 driver。"
fi
