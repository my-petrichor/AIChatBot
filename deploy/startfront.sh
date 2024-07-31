#!/bin/bash

if [ ! -d nginx-front ]; then
    tar xzf nginxfront.tar.gz
fi

cd nginx-front
make up