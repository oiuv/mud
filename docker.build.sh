#!/bin/bash

#git clone https://github.com/fluffos/fluffos.git
cd fluffos && rm -rf build && git pull && docker build -t fluffos:latest .
