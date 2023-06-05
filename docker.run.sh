#!/bin/bash

docker run --rm -p 8080:80 -v $(pwd):/opt/mud fluffos /opt/mud/docker.config.cfg
