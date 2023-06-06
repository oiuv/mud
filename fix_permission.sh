#!/bin/bash

find . -type d ! -path "./log/*" -exec chmod 0755 {} +
find . -type f ! -path "./log/*" -exec chmod 0644 {} +
find . -type f -name "*.sh" ! -path "./log/*" -exec chmod 0755 {} +
find . -type f -name "*.py" ! -path "./log/*" -exec chmod 0755 {} +
