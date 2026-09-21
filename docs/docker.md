Docker 备忘清单
===

Docker 容器、镜像、网络、存储与常见排错命令速查表。

容器
---

### 创建并运行

```shell
$ docker run --name web -d -p 127.0.0.1:8080:80 nginx:alpine
$ docker run --rm -it ubuntu:24.04 bash
```

参数 | 说明
:- | :-
`--name <NAME>` | 指定容器名
`-d` | 后台运行
`--rm` | 停止后自动删除
`-it` | 交互终端
`-p <HOST>:<CONTAINER>` | 发布端口
`-e KEY=VALUE` | 设置环境变量
`--env-file <FILE>` | 从文件读取环境变量
`--restart unless-stopped` | 异常或 Docker 重启后恢复容器
<!--rehype:className=show-header-->

绑定到 `127.0.0.1` 可避免端口暴露给外部网络。生产服务应固定明确的镜像标签或摘要，避免依赖可变的 `latest`。

### 查看与控制

```shell
$ docker ps
$ docker ps -a
$ docker start <CONTAINER>
$ docker stop <CONTAINER>
$ docker restart <CONTAINER>
$ docker rm <CONTAINER>
$ docker inspect <CONTAINER>
$ docker stats
```

`docker stop` 先发送停止信号并等待进程退出；`docker kill` 默认直接发送 `SIGKILL`，只在进程无法正常停止时使用。

### 进入与执行命令

```shell
$ docker exec -it <CONTAINER> sh
$ docker exec <CONTAINER> env
$ docker exec -u root -it <CONTAINER> bash
```

优先使用 `docker exec` 在运行中的容器创建新进程。`docker attach` 会连接主进程的输入输出，退出或发送信号可能影响容器主进程。

### 日志与进程

```shell
$ docker logs <CONTAINER>
$ docker logs -f --tail 100 <CONTAINER>
$ docker top <CONTAINER>
$ docker port <CONTAINER>
$ docker diff <CONTAINER>
```

应用日志应写入标准输出和标准错误，便于 `docker logs`、Compose 或日志驱动统一收集。

### 复制文件

```shell
$ docker cp ./config.json <CONTAINER>:/app/config.json
$ docker cp <CONTAINER>:/var/log/app.log ./app.log
```

长期配置与数据应使用镜像、bind mount 或 volume 管理；`docker cp` 更适合临时调试和数据取回。

### GPU 与共享内存

```shell
$ docker run --rm -it \
  --gpus all \
  --shm-size 16g \
  -v /data:/data \
  nvidia/cuda:<TAG> bash
```

`--gpus all` 需要宿主机驱动与 NVIDIA Container Toolkit。机器学习任务常用 `--shm-size` 扩大 `/dev/shm`。不要为方便默认添加 `--privileged` 或 `--network host`；它们显著扩大容器权限和宿主机暴露面。

镜像
---

### 拉取、查看与删除

```shell
$ docker pull nginx:alpine
$ docker image ls
$ docker image inspect nginx:alpine
$ docker image history nginx:alpine
$ docker image rm nginx:alpine
```

镜像由只读层组成；容器运行时在其上增加可写层。应用变更应重新构建镜像，而不是长期修改运行中的容器。

### 构建与标记

```shell
$ docker build -t example/app:1.0 .
$ docker build --pull --no-cache -t example/app:1.0 .
$ docker tag example/app:1.0 registry.example.com/example/app:1.0
$ docker push registry.example.com/example/app:1.0
```

Dockerfile 写法与缓存优化参见 [Dockerfile](./dockerfile.md)。

### 导出与加载镜像

```shell
$ docker save -o app-1.0.tar example/app:1.0
$ docker load -i app-1.0.tar
```

`docker save` / `load` 保留镜像层、标签和元数据。`docker export` / `import` 针对容器文件系统快照，不保留镜像历史，通常不用于镜像分发。

### 从容器创建镜像

```shell
$ docker commit <CONTAINER> debug-snapshot:latest
```

`docker commit` 适合临时取证或调试快照，不适合可复现构建。正式镜像应由版本控制中的 Dockerfile 生成。

存储
---

### Volume

```shell
$ docker volume create app-data
$ docker run -d --name db \
  --mount source=app-data,target=/var/lib/postgresql/data \
  postgres:<TAG>
$ docker volume inspect app-data
$ docker volume ls
$ docker volume rm app-data
```

Volume 由 Docker 管理，独立于容器生命周期，适合数据库和长期数据。删除容器不会自动删除命名 volume。

### Bind mount

```shell
$ docker run --rm \
  --mount type=bind,source="$(pwd)",target=/workspace,readonly \
  alpine:3.21 ls /workspace
```

Bind mount 直接映射宿主机路径，适合源码和配置。默认可写，能修改宿主机文件；只读场景应添加 `readonly`。挂载会遮住容器目标路径原有内容。

### tmpfs

```shell
$ docker run --rm --mount type=tmpfs,target=/run/cache alpine:3.21
```

tmpfs 数据只保存在内存，容器停止后消失，适合缓存和不应写入磁盘的临时数据。

网络
---

### 自定义网络

```shell
$ docker network create app-net
$ docker run -d --name db --network app-net postgres:<TAG>
$ docker run -d --name api --network app-net example/api:1.0
$ docker network inspect app-net
$ docker network connect app-net <CONTAINER>
$ docker network disconnect app-net <CONTAINER>
```

同一自定义网络中的容器可用容器名互相解析。不要使用已废弃的 `--link`；多容器应用优先使用 [Docker Compose](./docker-compose.md)。

运行时配置
---

### 资源限制

```shell
$ docker run -d --name api \
  --cpus 2 \
  --memory 1g \
  --memory-swap 1g \
  --pids-limit 256 \
  example/api:1.0
```

`--memory-swap` 与 `--memory` 相同时表示不使用 swap。先根据应用的实际峰值设置限制，再通过 `docker stats` 观察，避免把正常峰值误判为异常。

### 更新容器配置

```shell
$ docker update --restart unless-stopped <CONTAINER>
$ docker update --cpus 2 --memory 1g <CONTAINER>
$ docker rename <OLD_NAME> <NEW_NAME>
```

`docker update` 只能修改部分运行时选项。端口、挂载、环境变量或镜像变更需要重新创建容器，建议用 Compose 或脚本保留可复现配置。

### 登录镜像仓库

```shell
$ printf '%s' "$REGISTRY_TOKEN" | \
  docker login registry.example.com --username <USER> --password-stdin
$ docker logout registry.example.com
```

使用 `--password-stdin` 避免密码出现在 shell 历史和进程参数中。凭据会保存到 Docker 配置或已配置的 credential store。

排错与清理
---

### 常见检查

```shell
$ docker version
$ docker info
$ docker system df
$ docker events
$ docker inspect <CONTAINER>
$ docker logs --tail 200 <CONTAINER>
```

容器立即退出时先检查日志、主进程退出码和配置：

```shell
$ docker inspect --format '{{.State.ExitCode}} {{.State.Error}}' <CONTAINER>
```

### 清理

```shell
$ docker container prune
$ docker image prune
$ docker network prune
$ docker builder prune
$ docker system prune
```

`prune` 会删除未使用资源，执行前先用 `docker system df` 和对应的 `ls` 命令确认范围。`docker system prune --volumes` 还会删除未使用 volume，可能造成数据丢失。

### 容器内临时修复

```shell
$ docker exec -u root -it <CONTAINER> sh
# Debian / Ubuntu 镜像
# apt-get update && apt-get install -y ca-certificates curl
```

容器内换源、安装 SSH、修改 DNS 或编辑配置只适合临时排错；重新创建容器后会丢失。需要长期保留的改动应写入 Dockerfile、Compose 配置或挂载文件。

另见
---

- [Docker CLI 参考](https://docs.docker.com/reference/cli/docker/) _(docs.docker.com)_
- [Dockerfile](./dockerfile.md)
- [Docker Compose](./docker-compose.md)
