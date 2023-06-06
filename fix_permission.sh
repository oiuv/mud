#!/bin/bash

find . -type d -exec chmod 0755 {} +
find . -type f ! -path "./fluffos/*" ! -path "./log/*" -exec chmod 0644 {} +
find . -type f ! -path "./fluffos/*" ! -path "./log/*" -name "*.sh" -exec chmod 0755 {} +
find . -type f ! -path "./fluffos/*" ! -path "./log/*" -name "*.py" -exec chmod 0755 {} +
