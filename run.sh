#!/bin/bash

# 判断 driver 文件是否存在
if [ -f "fluffos/build/bin/driver" ]; then
    # 如果 driver 文件存在，则运行 ./fluffos/build/bin/driver config.cfg
    cd $(dirname "$0")
    ./fluffos/build/bin/driver config.ini
else
    # 如果 driver 文件不存在，则提示请先运行 build.sh 编译 driver
    echo "Please run build.sh first to compile the driver."
fi
