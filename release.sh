#!/bin/bash

# 打包生产环境文件
tar czf dist.tar.gz dist
echo "打包完成"

# 复制到生产环境
scp -C dist.tar.gz rellux:/home/
echo "复制完成"

# 在生产环境执行命令
ssh rellux > /dev/null 2>&1 << eeooff
cd /home
tar xzf dist.tar.gz
rm -rf /root/nginx-front/dist/*
cp -r dist/* /root/nginx-front/dist/
rm -rf /home/dist
rm -f dist.tar.gz
eeooff

echo "执行完成"

# 清理生产环境文件压缩包
rm -f dist.tar.gz
echo done!
