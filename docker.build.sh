#!/bin/bash

cd fluffos && rm -rf build && git pull && docker build -t fluffos:latest .
