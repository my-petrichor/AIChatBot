#!/bin/bash

# 查找进程ID
pid=$(pgrep -f npm)

# 杀死进程
if [ ! -z "$pid" ]; then
    kill -9 "$pid"
fi

nohup npm run dev > output.log 2>&1 &
