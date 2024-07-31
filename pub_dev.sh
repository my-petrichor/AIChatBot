#!/bin/bash

#/data/root/projects/neutrino/docnotes-view/nginx-front/dist
# 复制 dist 内容到 nginx 配置的目录下
rm -rf /data/root/projects/neutrino/docnotes-view/nginx-front/dist/*
ls -al /data/root/projects/neutrino/docnotes-view/nginx-front/dist/
cp -r dist/* /data/root/projects/neutrino/docnotes-view/nginx-front/dist/
echo "执行完成"
