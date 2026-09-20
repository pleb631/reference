# Python 环境与包管理备忘清单

这是一份将 **Conda、uv 与 pip** 放在同一工作流中使用的速查表。

## 先选工具

| 需求 | 推荐 | 原因 |
| :-- | :-- | :-- |
| 数据科学、CUDA、跨语言二进制依赖 | Conda | 同时管理 Python、非 Python 依赖和环境 |
| 新 Python 项目、需要快速解析与锁定依赖 | uv | 统一管理 Python、虚拟环境、依赖与 lock 文件 |
| 仅在现有环境中安装 Python 包 | pip | 生态最通用，几乎所有 Python 环境都可用 |

> 一个项目只选一种依赖管理器作为“唯一真相”：Conda 用 `environment.yml`，uv 用 `pyproject.toml` 与 `uv.lock`，pip 用 `requirements.txt`。不要让三者同时写入同一个环境的依赖状态。

## 常用工作流

### 使用 uv 创建新项目

```sh
uv init my-project
cd my-project
uv add requests
uv run main.py
```

`uv init` 会创建 `pyproject.toml`；首次安装或运行时会自动创建 `.venv` 和 `uv.lock`。提交 `pyproject.toml` 与 `uv.lock`，不要提交 `.venv`。

### 使用 Conda 创建数据科学环境

```sh
conda create -n analysis python=3.12
conda activate analysis
conda install numpy pandas
python -m pip install some-pypi-only-package
```

可在 Conda 环境中使用 `python -m pip` 安装 Conda 渠道中不存在的包；优先安装 Conda 包，再安装 pip 包，避免随后再由 Conda 改动同一批依赖。

### 使用 pip 管理现有虚拟环境

```sh
python -m venv .venv
# Windows: .venv\Scripts\Activate.ps1
# macOS / Linux: source .venv/bin/activate
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
```

## Conda

### 环境管理

| 命令 | 说明 |
| :-- | :-- |
| `conda info` | 查看版本、路径和渠道等信息 |
| `conda create -n <ENV> python=3.12` | 创建指定 Python 版本的环境 |
| `conda activate <ENV>` | 激活环境 |
| `conda env list` / `conda info -e` | 列出环境 |
| `conda create --clone <ENV> -n <NEW_ENV>` | 克隆环境 |
| `conda rename -n <ENV> <NEW_ENV>` | 重命名环境 |
| `conda env remove -n <ENV>` | 删除环境 |
| `conda config --set auto_activate_base false` | 禁止 shell 自动激活 base |

### 包与渠道

```sh
conda list
conda search <PACKAGE> --info
conda install <PACKAGE>
conda install <PACKAGE>=3.1.4
conda install -c conda-forge <PACKAGE>
conda update <PACKAGE>
conda update --all
conda remove <PACKAGE>
conda config --show-sources
conda config --add channels <CHANNEL>
conda config --remove channels <CHANNEL>
```

### 导出、复现与回滚

```sh
# 可跨平台复现：只导出显式安装的包
conda env export --from-history > environment.yml

# 完整导出当前或指定环境
conda env export > environment.yml
conda env export -n <ENV> > environment.yml
conda env create -n <ENV> --file environment.yml

# 查看和回滚环境修订
conda list -n <ENV> --revisions
conda install -n <ENV> --revision <NUMBER>

conda clean --all
```

## uv

### 安装

```sh
# macOS / Linux
curl -LsSf https://astral.sh/uv/install.sh | sh

# Windows PowerShell
powershell -ExecutionPolicy ByPass -c "irm https://astral.sh/uv/install.ps1 | iex"

# 或在现有环境中安装
python -m pip install uv
```

### 项目与依赖

```sh
uv init [PROJECT_NAME]             # 新建项目；省略名称则使用当前目录
uv add requests                    # 添加依赖
uv add 'requests==2.28.1'          # 固定版本
uv add git+https://github.com/psf/requests
uv add -r requirements.txt         # 迁移 requirements.txt
uv remove requests
uv lock --upgrade-package requests
uv sync                            # 按 lock 文件同步环境
uv run main.py
uv run --python 3.10 main.py
uv build
```

`uv build` 的构建产物位于 `dist/`。使用 `uv add` 后应一并提交更新的 `pyproject.toml` 与 `uv.lock`。

## pip

始终优先使用 `python -m pip`，它能确保调用的是当前 Python 解释器对应的 pip。

### 安装、查看与卸载

```sh
python -m pip install <PACKAGE>
python -m pip install <PACKAGE>==1.2.3
python -m pip install '<PACKAGE>>=1.0,<2.0'
python -m pip install <WHEEL_FILE>
python -m pip install git+https://github.com/<OWNER>/<REPO>.git
python -m pip install .
python -m pip install -e .         # 可编辑安装，适用于开发
python -m pip list
python -m pip show <PACKAGE>
python -m pip uninstall <PACKAGE>
python -m pip install --upgrade <PACKAGE>
```

### 依赖、检查与缓存

```sh
python -m pip freeze > requirements.txt
python -m pip install -r requirements.txt
python -m pip check
python -m pip cache dir
python -m pip cache purge
```

`pip freeze` 更适合生成当前环境的精确快照；库项目通常应在 `pyproject.toml` 中声明直接依赖，而不是仅依赖 freeze 结果。

### 镜像源

```sh
# 单次使用
python -m pip install -i https://pypi.tuna.tsinghua.edu.cn/simple <PACKAGE>

# 设置默认镜像
python -m pip config set global.index-url https://pypi.tuna.tsinghua.edu.cn/simple
```

## 常见问题

| 情况 | 处理方式 |
| :-- | :-- |
| `pip` 装到了错误的 Python | 使用 `python -m pip`，并用 `python -m pip --version` 检查路径 |
| Conda 与 pip 依赖冲突 | 重新创建环境，先装 Conda 包，再装 pip-only 包 |
| CI 与本地版本不一致 | Conda 提交 `environment.yml`；uv 提交 `uv.lock`；pip 固定 requirements 中的版本 |
| 需要切换 Python 版本 | Conda 用 `conda create ... python=<VERSION>`；uv 用 `uv run --python <VERSION>` |

## 参考

- [Conda 文档](https://docs.conda.io/)
- [uv 文档](https://docs.astral.sh/uv/)
- [pip 文档](https://pip.pypa.io/en/stable/)
