#!/bin/bash

# 如果 fluffos 目录不存在，则从 gitee 克隆 fluffos 仓库
if [ ! -d "fluffos" ]; then
    git clone https://gitee.com/fluffos/fluffos.git
fi

# 进入 fluffos 目录并拉取最新代码
cd fluffos && git checkout . && git pull

# 如果 build 目录已存在，则删除
if [ -d "build" ]; then
    rm -rf build
fi

# 构建 docker 镜像
docker build -t fluffos:latest .
