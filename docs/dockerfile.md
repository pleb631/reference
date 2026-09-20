Dockerfile 备忘清单
===

使用 Dockerfile 构建安全、可复现且缓存友好的容器镜像。

基础
---

### 最小示例

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.13-slim

WORKDIR /app
COPY . .

CMD ["python", "-m", "app"]
```

```shell
$ docker build -t example/app:1.0 .
$ docker run --rm example/app:1.0
```

构建命令最后的 `.` 是 build context。`COPY` 只能读取 context 内的文件；用 `.dockerignore` 排除无关文件和密钥。

### 常用指令

指令 | 作用
:- | :-
`FROM <IMAGE>` | 设置基础镜像并开始新阶段
`WORKDIR <PATH>` | 设置后续指令的工作目录
`COPY <SRC> <DEST>` | 从 context 或其他阶段复制文件
`RUN <COMMAND>` | 构建阶段执行命令并创建镜像层
`ENV KEY=VALUE` | 设置构建后仍存在的环境变量
`ARG NAME=VALUE` | 声明只用于构建的参数
`USER <USER>` | 设置后续构建与运行的用户
`EXPOSE <PORT>` | 记录容器预期监听端口，不会自动发布
`ENTRYPOINT [...]` | 设置固定可执行程序
`CMD [...]` | 设置默认命令或默认参数
`HEALTHCHECK` | 定义容器健康检查
<!--rehype:className=show-header-->

### COPY 与 ADD

```dockerfile
COPY --chown=app:app pyproject.toml uv.lock /app/
COPY --from=build /src/dist/app /usr/local/bin/app
```

普通文件复制优先使用 `COPY`。只有确实需要自动解压本地 tar、远程 URL 或 Git 源等额外行为时才使用 `ADD`。

### CMD 与 ENTRYPOINT

```dockerfile
ENTRYPOINT ["python", "-m", "app"]
CMD ["--host", "0.0.0.0", "--port", "8000"]
```

Exec 形式不会经过 shell，能正确传递信号，通常优于 `CMD command ...`。运行时参数会替换 `CMD`，`docker run --entrypoint` 才会替换 `ENTRYPOINT`。

### ARG 与 ENV

```dockerfile
ARG APP_VERSION=dev
ENV APP_VERSION=$APP_VERSION \
    PYTHONUNBUFFERED=1
```

`ARG` 在构建时通过 `--build-arg` 传入；`ENV` 会保留在最终镜像与容器中。两者都不适合传递密码、令牌或私钥。

构建实践
---

### 缓存友好的顺序

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.13-slim
WORKDIR /app

COPY requirements.txt ./
RUN --mount=type=cache,target=/root/.cache/pip \
    python -m pip install --requirement requirements.txt

COPY . .
```

先复制较少变化的依赖清单，再复制源码，可最大化缓存复用。BuildKit cache mount 会跨构建保存下载缓存，但不会写入最终镜像层。

### 系统包

```dockerfile
RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
    && rm -rf /var/lib/apt/lists/*
```

`apt-get update` 与安装必须位于同一 `RUN`，并清理索引。只安装运行时必需包；编译器等构建依赖放到单独构建阶段。

### 多阶段构建

```dockerfile
# syntax=docker/dockerfile:1
FROM golang:1.26 AS build
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /out/server ./cmd/server

FROM scratch
COPY --from=build /out/server /server
USER 65532:65532
ENTRYPOINT ["/server"]
```

多阶段构建把编译工具留在构建阶段，只复制运行产物。可用 `docker build --target build .` 停在指定阶段调试。

### 构建密钥

```shell
$ docker build --secret id=token,src=./token.txt .
```

```dockerfile
RUN --mount=type=secret,id=token \
    TOKEN="$(cat /run/secrets/token)" ./download-private-artifact
```

密钥 mount 只在该条 `RUN` 执行时可见。不要用 `ARG`、`ENV` 或 `COPY` 传递秘密，它们可能出现在镜像配置、层或构建历史中。

### 非 root 用户

```dockerfile
RUN groupadd --system --gid 10001 app \
    && useradd --system --uid 10001 --gid app --create-home app

COPY --chown=app:app . /app
USER app
```

服务无需 root 权限时显式切换用户。固定 UID/GID 可改善 bind mount 与编排环境中的权限一致性。

### 健康检查

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD ["curl", "--fail", "http://localhost:8000/health"]
```

健康检查命令必须存在于最终镜像中。检查应快速、稳定，并能反映服务是否可以处理请求。

忽略与构建
---

### .dockerignore

```ignore
.git
.env
.venv
__pycache__/
dist/
node_modules/
*.log
```

`.dockerignore` 减少发送给 builder 的 context，避免无关文件破坏缓存或进入镜像。它不是秘密管理机制；敏感文件仍不应放入 context。

### 构建命令

```shell
$ docker build -t example/app:1.0 .
$ docker build -f docker/Dockerfile -t example/app:1.0 .
$ docker build --target build -t example/app:build .
$ docker build --pull --no-cache -t example/app:1.0 .
$ docker buildx build --platform linux/amd64,linux/arm64 -t example/app:1.0 --push .
```

`--pull` 更新基础镜像，`--no-cache` 禁用已有构建缓存；两者作用不同。多平台构建与推送使用 `buildx`。

检查清单
---

### 推荐

- 使用维护中的官方基础镜像并固定明确版本范围。
- 使用多阶段构建缩小运行镜像。
- 让单个容器只负责一个清晰的服务职责。
- 先复制依赖清单，再复制经常变化的源码。
- 使用 exec 形式的 `ENTRYPOINT` / `CMD`。
- 使用非 root 用户运行服务。
- 将持久数据放入 volume，不写入容器可写层。

### 避免

- 不要把凭据写入 `ARG`、`ENV`、构建 context 或镜像层。
- 不要依赖 `docker commit` 代替 Dockerfile。
- 不要为省事长期使用 `latest`、`--privileged` 或 root 用户。
- 不要在镜像内启动 SSH 服务；使用 `docker exec` 调试容器。
- 不要用 `ONBUILD` 隐藏子镜像构建步骤，除非维护专用基础镜像。

另见
---

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/) _(docs.docker.com)_
- [Docker 构建最佳实践](https://docs.docker.com/build/building/best-practices/) _(docs.docker.com)_
- [Docker](./docker.md)
- [Docker Compose](./docker-compose.md)
