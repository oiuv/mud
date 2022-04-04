#!/bin/bash

cd fluffos || git clone https://github.com/fluffos/fluffos.git && cd fluffos

git pull
rm -rf build && mkdir build && cd build
cmake -DPACKAGE_DB_MYSQL=1 -DPACKAGE_DB_SQLITE=2 .. && make -j4 install
