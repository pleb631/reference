Python 环境与包管理备忘清单
===

使用 mamba/Conda 管理跨语言环境，或使用 uv 管理 Python 项目、解释器与依赖。

工具选择
---

### 怎么选

场景 | 推荐工具 | 依赖来源
:- | :- | :-
数据科学、CUDA、系统库、跨语言依赖 | mamba | conda-forge 等 Conda channel
普通 Python 应用或库 | uv | PyPI、Git、本地路径
已有 `requirements.txt` 工作流 | `uv pip` | PyPI、Git、本地路径
<!--rehype:className=show-header-->

同一项目只保留一套依赖状态：mamba/Conda 使用 `environment.yml`，uv 使用 `pyproject.toml` 与 `uv.lock`。不要让两个管理器反复覆盖同一批包。

### mamba 与 conda

`mamba` 管理 Conda 环境，并与常用 `conda` 命令兼容。本页默认使用 mamba 执行创建、安装和更新；没有安装 mamba 时，可把这些示例中的 `mamba` 换成 `conda`。完整 Conda CLI 操作仍保留 `conda` 命令。

```shell
$ mamba create -n analysis python=3.12 numpy pandas
$ mamba activate analysis
$ mamba install -c conda-forge jupyterlab
```

### uv 与 pip

uv 已内置 `uv pip` 兼容接口，可覆盖常见的 pip、pip-tools 和 virtualenv 工作流，无需另外调用 pip。`uv pip` 不依赖也不会调用 pip，其行为并非在所有细节上都与 pip 相同。

新项目优先使用高层项目命令 `uv add`、`uv lock`、`uv sync` 和 `uv run`；维护 `requirements.txt` 时再使用 `uv pip`。

mamba / Conda
---

### 环境管理

命令 | 说明
:- | :-
`mamba create -n <ENV> python=3.12` | 创建环境并安装 Python
`mamba activate <ENV>` | 激活环境
`mamba deactivate` | 退出当前环境
`mamba env list` | 列出环境
`mamba env remove -n <ENV>` | 删除环境
`mamba run -n <ENV> <COMMAND>` | 不激活环境直接运行命令
<!--rehype:className=show-header-->

首次使用前需要完成 shell 初始化；若激活命令不可用，可执行 `mamba shell init --shell <SHELL>` 后重启 shell。

### 包管理

```shell
$ mamba search <PACKAGE> --info
$ mamba install <PACKAGE>
$ mamba install <PACKAGE>=3.1.4
$ mamba install -c conda-forge <PACKAGE>
$ mamba update <PACKAGE>
$ mamba update --all
$ mamba remove <PACKAGE>
$ mamba list
```

优先从同一 channel 安装依赖，减少 ABI 与依赖解析冲突。使用 conda-forge 时，建议保持 channel 配置一致。

### PyPI-only 包

当 Conda channel 中没有所需包时，可在已激活的环境中使用 uv 的 pip 兼容接口：

```shell
$ mamba create -n analysis python=3.12 uv
$ mamba activate analysis
$ uv pip install <PACKAGE>
```

先完成所有 mamba 安装，再安装 PyPI-only 包。mamba/Conda 无法完整追踪由 `uv pip` 或 pip 写入的包，后续若需大幅修改 Conda 依赖，重新创建环境通常更可靠。

### 导出与复现

```shell
# 完整 Conda CLI 负责导出与更新环境文件
# 只导出显式安装的包，跨平台更友好
$ conda env export --from-history > environment.yml

# 导出完整环境
$ conda env export > environment.yml

# 从文件创建或更新环境
$ mamba create -n <ENV> --file environment.yml
$ conda env update -n <ENV> --file environment.yml --prune
```

`environment.yml` 中可使用 `pip:` 子项记录 PyPI-only 依赖，但环境仍应由 mamba/Conda 统一创建。

### 修订与清理

```shell
$ conda list -n <ENV> --revisions
$ conda install -n <ENV> --revision <NUMBER>
$ mamba clean --all
```

uv
---

### 安装与更新

```shell
# macOS / Linux
$ curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows PowerShell
PS> powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 独立安装程序安装后可自更新
$ uv self update
```

uv 是独立二进制文件，不要求系统预先安装 Python。

### 新项目工作流
<!--rehype:wrap-class=row-span-2-->

```shell
$ uv init my-project
$ cd my-project
$ uv add requests
$ uv add --dev pytest
$ uv run pytest
$ uv build
```

命令 | 作用
:- | :-
`uv add <PACKAGE>` | 添加依赖并更新 lock 文件与环境
`uv remove <PACKAGE>` | 删除依赖
`uv lock` | 更新 `uv.lock`
`uv sync` | 按 lock 文件同步 `.venv`
`uv run <COMMAND>` | 在同步后的项目环境中运行命令
`uv build` | 在 `dist/` 中构建源码包和 wheel
<!--rehype:className=show-header-->

提交 `pyproject.toml` 与 `uv.lock`，不要提交 `.venv`。项目模式通常不需要手动激活虚拟环境。

### Python 版本

```shell
$ uv python list
$ uv python install 3.12
$ uv python find 3.12
$ uv python pin 3.12
$ uv python uninstall 3.11
```

`uv python pin` 会为项目写入 `.python-version`。运行 `uv run --python 3.12 <COMMAND>` 可临时指定解释器。

### 虚拟环境

```shell
$ uv venv
$ uv venv --python 3.12
$ uv venv myenv

# macOS / Linux
$ source .venv/bin/activate

# Windows PowerShell
PS> .venv\Scripts\Activate.ps1
```

后续 `uv pip` 命令会优先使用已激活环境，然后查找当前目录或父目录中的 `.venv`。没有合适环境时，先运行 `uv venv`。

### uv pip

```shell
$ uv pip install requests
$ uv pip install 'requests==2.32.5'
$ uv pip install -r requirements.txt
$ uv pip uninstall requests
$ uv pip list
$ uv pip tree
$ uv pip check
$ uv pip freeze
```

`uv pip install` 直接修改环境，不会更新项目的 `pyproject.toml` 或 `uv.lock`。uv 项目应使用 `uv add`；只有低层环境操作或旧式 requirements 工作流才使用 `uv pip`。

### 编译与同步 requirements

```shell
$ uv pip compile requirements.in -o requirements.txt
$ uv pip compile pyproject.toml -o requirements.txt
$ uv pip sync requirements.txt
```

`uv pip install -r` 在现有环境上增量安装；`uv pip sync` 会让环境精确匹配文件，并移除文件中未声明的包。

### 从旧项目迁移

```shell
$ uv init
$ uv add -r requirements.txt
$ uv sync
```

检查生成的 `pyproject.toml` 后，提交它和 `uv.lock`。确认迁移完成后，再决定是否保留旧的 requirements 文件。

排错
---

### 常见问题

问题 | 处理方式
:- | :-
mamba 激活命令不可用 | 初始化对应 shell，然后重新打开终端
Conda 与 PyPI 依赖冲突 | 重建环境；先用 mamba 安装，再用 `uv pip` 补充
`uv pip` 找不到环境 | 运行 `uv venv`，或激活已有 Conda/venv 环境
项目依赖与环境不一致 | 运行 `uv sync`；CI 使用 `uv sync --locked`
只想运行一次工具 | 使用 `uvx <TOOL>`，无需把工具加入项目依赖
<!--rehype:className=show-header-->

另见
---

- [Mamba 用户指南](https://mamba.readthedocs.io/en/latest/user_guide/mamba.html) _(mamba.readthedocs.io)_
- [Conda 官方文档](https://docs.conda.io/) _(docs.conda.io)_
- [uv 项目指南](https://docs.astral.sh/uv/guides/projects/) _(docs.astral.sh)_
- [uv pip 接口](https://docs.astral.sh/uv/pip/) _(docs.astral.sh)_
