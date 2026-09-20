Docker Compose 备忘清单
===

使用 Compose Specification 定义、运行和排查多容器应用。

入门
---

### 最小示例

```yaml
name: demo

services:
  web:
    image: nginx:alpine
    ports:
      - "127.0.0.1:8080:80"
```

```shell
$ docker compose up -d
$ docker compose ps
$ docker compose logs -f
$ docker compose down
```

推荐文件名为 `compose.yaml`。使用 `docker compose`（空格）调用 Compose v2；旧的 `docker-compose` 独立程序和顶层 `version` 字段不再用于新项目。

### 常用命令

命令 | 作用
:- | :-
`docker compose up -d` | 创建并后台启动服务
`docker compose down` | 停止并删除容器与默认网络
`docker compose ps` | 查看服务状态
`docker compose logs -f [SERVICE]` | 跟随日志
`docker compose exec <SERVICE> sh` | 在运行中的服务执行命令
`docker compose run --rm <SERVICE> <CMD>` | 创建一次性容器执行命令
`docker compose build` | 构建服务镜像
`docker compose pull` | 拉取服务镜像
`docker compose restart [SERVICE]` | 重启服务
`docker compose config` | 展开并校验最终配置
<!--rehype:className=show-header-->

### 文件与项目名

```shell
$ docker compose -f compose.yaml -f compose.prod.yaml up -d
$ docker compose -p myapp up -d
$ docker compose --env-file .env.prod config
```

后面的 Compose 文件会覆盖或扩展前面的配置。项目名决定容器、网络和 volume 的名称前缀，可由顶层 `name`、`-p` 或 `COMPOSE_PROJECT_NAME` 设置。

服务配置
---

### 完整示例
<!--rehype:wrap-class=col-span-2 row-span-2-->

```yaml
name: myapp

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: runtime
    image: example/api:dev
    command: ["python", "-m", "app"]
    init: true
    restart: unless-stopped
    ports:
      - "127.0.0.1:${API_PORT:-8000}:8000"
    environment:
      DATABASE_URL: postgresql://app:${DB_PASSWORD}@db/app
    env_file:
      - path: .env
        required: false
    volumes:
      - ./src:/app/src:ro
    depends_on:
      db:
        condition: service_healthy
    networks:
      - backend

  db:
    image: postgres:17
    environment:
      POSTGRES_USER: app
      POSTGRES_PASSWORD: ${DB_PASSWORD:?set DB_PASSWORD}
      POSTGRES_DB: app
    volumes:
      - db-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U app -d app"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks:
      - backend

volumes:
  db-data:

networks:
  backend:
```

不要提交包含真实密码的 `.env`。开发环境可用 `.env.example` 记录所需变量名，生产环境使用平台秘密管理或 Compose secrets。

### image 与 build

```yaml
services:
  api:
    image: example/api:1.0
    build:
      context: .
      dockerfile: docker/Dockerfile
      target: runtime
      args:
        APP_VERSION: "1.0"
```

只有 `image` 时直接拉取或使用本地镜像；配置 `build` 时可用 `docker compose build` 构建。`docker compose up --build` 会在启动前构建。

### command 与 entrypoint

```yaml
services:
  worker:
    image: example/worker:1.0
    entrypoint: ["python", "-m", "worker"]
    command: ["--queue", "high"]
```

`command` 覆盖镜像的 `CMD`，`entrypoint` 覆盖 `ENTRYPOINT`。列表形式避免额外 shell 解析。

### 端口

```yaml
services:
  web:
    ports:
      - "127.0.0.1:8080:80"
    expose:
      - "9090"
```

`ports` 将端口发布到宿主机；省略宿主机地址通常会监听所有接口。`expose` 只记录容器端口，不发布到宿主机；同一 Compose 网络中的服务本来就可直接互访。

### 环境变量

```yaml
services:
  api:
    environment:
      LOG_LEVEL: ${LOG_LEVEL:-info}
      API_TOKEN: ${API_TOKEN:?API_TOKEN is required}
    env_file:
      - .env
```

`${NAME:-default}` 提供默认值，`${NAME:?message}` 在缺失时中止。运行 `docker compose config --environment` 可检查插值来源；`environment` 的值会覆盖 `env_file` 中的同名项。

### depends_on 与健康检查

```yaml
services:
  api:
    depends_on:
      db:
        condition: service_healthy

  db:
    image: postgres:17
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5
```

短语法 `depends_on: [db]` 只控制启动顺序，不保证数据库已经可用。需要等待就绪时配置 `healthcheck` 与 `service_healthy`，应用本身仍应实现连接重试。

存储与网络
---

### Volume 与 bind mount

```yaml
services:
  db:
    volumes:
      - db-data:/var/lib/postgresql/data

  web:
    volumes:
      - type: bind
        source: ./src
        target: /app/src
        read_only: true

volumes:
  db-data:
```

命名 volume 适合持久化应用数据；bind mount 适合开发源码和宿主机配置。`docker compose down` 不删除命名 volume，`docker compose down -v` 会删除并可能造成数据丢失。

### 外部 Volume

```yaml
volumes:
  shared-data:
    external: true
    name: company-shared-data
```

外部资源由 Compose 项目之外创建和管理，`down` 不会删除。启动前必须确保资源已经存在。

### 服务发现

```yaml
services:
  api:
    networks: [backend]
  db:
    networks: [backend]

networks:
  backend:
```

同一网络内使用服务名和容器端口访问，例如 `db:5432`，不要使用宿主机发布端口或写死容器 IP。

开发与部署
---

### 开发覆盖文件

```yaml
# compose.override.yaml
services:
  api:
    build: .
    volumes:
      - ./src:/app/src
    environment:
      DEBUG: "true"
```

默认情况下 Compose 会自动合并 `compose.yaml` 与 `compose.override.yaml`。生产配置建议显式使用多个 `-f` 文件并用 `docker compose config` 检查结果。

### Profiles

```yaml
services:
  adminer:
    image: adminer
    profiles: [tools]
```

```shell
$ docker compose --profile tools up -d
```

Profiles 适合调试工具、管理界面和可选服务。没有 profile 的核心服务始终启用。

### 扩缩容

```shell
$ docker compose up -d --scale worker=3
```

被扩容的服务不应设置固定 `container_name` 或独占宿主机端口。Compose 适合单机多容器应用，不等同于集群编排器。

### Secrets

```yaml
services:
  api:
    secrets:
      - api_token

secrets:
  api_token:
    file: ./secrets/api_token.txt
```

容器内默认从 `/run/secrets/api_token` 读取。不要把秘密放进镜像、Git 或普通环境变量示例；生产环境结合部署平台的秘密管理能力。

排错与清理
---

### 检查最终配置

```shell
$ docker compose config
$ docker compose config --services
$ docker compose config --images
$ docker compose ps -a
$ docker compose logs --tail 200 <SERVICE>
$ docker compose events
```

插值、覆盖文件和 YAML 合并导致的问题，先查看 `docker compose config` 输出。

### 重建与清理

```shell
$ docker compose up -d --build --remove-orphans
$ docker compose up -d --force-recreate
$ docker compose down --remove-orphans
$ docker compose down -v
```

`--force-recreate` 会重建容器；`down -v` 会删除项目命名 volume。数据库等持久数据清理前必须确认或备份。

另见
---

- [Compose Specification](https://docs.docker.com/reference/compose-file/) _(docs.docker.com)_
- [Docker](./docker.md)
- [Dockerfile](./dockerfile.md)
