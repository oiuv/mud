#!/bin/bash

if [ ! -d "fluffos" ]; then
    git clone https://gitee.com/mudren/fluffos.git
fi
cd fluffos && git pull
if [ -d "build" ]; then
    rm -rf build
fi
mkdir build && cd build
cmake -DPACKAGE_DB_MYSQL=1 -DPACKAGE_DB_SQLITE=2 .. && make -j4 install
