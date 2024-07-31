# 前端部署文档
1. 把本目录文件拷贝到新机器，运行 startfront.sh 脚本，以 docker 模式启动前端部分。脚本执行完后，当前目录会多一个 nginx-front 目录。
2. 有一个配置需要修改一下，在文件 nginx-front/conf.d/ai_front.conf 中 192.168.32.4 这个地址修改为机器的本地 ip
3. 之后在 nginx-front 路径下执行以下命令，就可以了
```shell
make down 
# 稍等一会儿
make up
```

本地ip 获取命令：
```shell
ifconfig
```
一般找 eth0 网卡的 IP