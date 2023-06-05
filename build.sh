#!/bin/bash

# 更新系统软件包列表
sudo apt update
# 安装软件包及依赖库
sudo apt install git bison build-essential autoconf automake cmake gcc g++ libjemalloc-dev zlib1g-dev libssl-dev libmysqlclient-dev libsqlite3-dev libpq-dev libpcre3-dev libevent-dev libicu-dev libdw-dev binutils-dev libgtest-dev telnet python3 -y

# 如果 fluffos 目录不存在，则从 gitee 克隆 fluffos 仓库
if [ ! -d "fluffos" ]; then
    git clone https://gitee.com/mudren/fluffos.git
fi

# 进入 fluffos 目录并拉取最新代码
cd fluffos && git checkout . && git pull

# 如果 build 目录已存在，则删除
if [ -d "build" ]; then
    rm -rf build
fi

# 创建 build 目录并进入
mkdir build && cd build

# 记录开始时间
starttime=`date +'%Y-%m-%d %H:%M:%S'`

# 编译 fluffos，使用多线程编译，开启 SQLite 数据库和默认数据库支持
cmake -DPACKAGE_DB_SQLITE=2 -DPACKAGE_DB_DEFAULT_DB=2 .. && make -j$(nproc) install

# 记录结束时间
endtime=`date +'%Y-%m-%d %H:%M:%S'`

# 计算编译时间
start_seconds=$(date --date=" $starttime" +%s);
end_seconds=$(date --date="$endtime" +%s);

# 输出编译时间
echo Start: $starttime.
echo End: $endtime.
echo "Build Time: "$((end_seconds-start_seconds))"s."

# 复制驱动至系统目录
sudo cp bin/driver /usr/local/games/
