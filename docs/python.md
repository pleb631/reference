Python 备忘清单
===

面向 Python 3.11+ 的常用语法、类型标注、标准库、并发与工程实践速查表。

基础数据
---

### 常用类型

```python
count = 3                  # int
ratio = 0.5               # float
name = "Ada"              # str
payload = b"data"         # bytes
enabled = True            # bool
missing = None            # None

items = [1, 2, 3]         # list，可变有序
point = (10, 20)          # tuple，不可变有序
tags = {"python", "cli"} # set，元素唯一
user = {"name": "Ada"}   # dict，键值映射
```

使用 `type(value)` 查看运行时类型，使用 `isinstance(value, int)` 判断类型。不要用 `type(value) == int` 代替可支持继承的 `isinstance()`。

### 切片与解包

```python
values = [0, 1, 2, 3, 4, 5]

values[1:4]   # [1, 2, 3]
values[::2]   # [0, 2, 4]
values[::-1]  # 反转副本

first, *middle, last = values
x, y = y, x
```

切片左闭右开。序列很大且不需要副本时，优先使用迭代器或 `itertools.islice()`。

### 字典

```python
user = {"name": "Ada", "active": True}

name = user.get("name", "unknown")
user["role"] = "admin"

for key, value in user.items():
    print(key, value)

merged = defaults | overrides  # Python 3.9+
```

直接访问缺失键会抛出 `KeyError`；需要默认值时使用 `dict.get()`。累计分组可使用 `collections.defaultdict`，计数可使用 `collections.Counter`。

### 集合运算

```python
a = {1, 2, 3}
b = {3, 4, 5}

a & b  # 交集：{3}
a | b  # 并集
a - b  # 差集
a ^ b  # 对称差
a <= b # 是否为子集
```

集合元素必须可哈希；`list`、`dict` 和 `set` 不能作为集合元素或字典键。

### 推导式

```python
squares = [value**2 for value in range(10) if value % 2 == 0]
lookup = {item.id: item for item in items}
unique = {item.category for item in items}
```

推导式适合简短映射和过滤。逻辑包含副作用、多层条件或异常处理时改用普通循环。

字符串与容器
---

### 字符串常用操作

```python
text = "  Hello, Python  "

text.strip()                    # "Hello, Python"
text.lower()                    # "  hello, python  "
text.replace("Python", "World")
text.startswith("  Hello")
"Python" in text

parts = "a,b,c".split(",")
joined = " / ".join(parts)
```

字符串不可变，这些方法返回新字符串。需要拆分固定次数时可使用 `split(sep, maxsplit)`；按行处理使用 `splitlines()`。

### f-string 格式化

```python
name = "Ada"
ratio = 0.256
amount = 1234567.8

f"Hello, {name}"
f"{ratio:.1%}"       # "25.6%"
f"{amount:,.2f}"     # "1,234,567.80"
f"{42:08d}"          # "00000042"
f"{name!r}"          # "'Ada'"
```

`!r` 调用 `repr()`，适合日志和调试；对齐、宽度、精度和千位分隔符写在冒号后。

### 列表的增删改查

```python
items = ["a", "b"]
items.append("c")
items.extend(["d", "e"])
items.insert(1, "x")

last = items.pop()
items.remove("x")
del items[0]

items.sort(key=str.lower)
position = items.index("b")
count = items.count("b")
```

`list.sort()` 原地修改并返回 `None`；`sorted(iterable)` 返回新列表。`remove()` 按值删除首个匹配项，`pop()` 按索引删除并返回元素。

流程与函数
---

### 分支与循环

```python
if score >= 90:
    grade = "A"
elif score >= 60:
    grade = "pass"
else:
    grade = "fail"

for value in values:
    if value < 0:
        continue
    if value == target:
        break

while queue:
    handle(queue.popleft())
```

空容器、空字符串、`0` 和 `None` 在条件中为假。循环的 `else` 仅在没有被 `break` 中断时执行。

### 函数返回与 Lambda

```python
def bounds(values: list[int]) -> tuple[int, int]:
    return min(values), max(values)

low, high = bounds([3, 1, 8])
users.sort(key=lambda user: user.name.casefold())
```

Python 通过元组返回多个值。`lambda` 适合 `key=` 等简短单表达式；逻辑较长或需要注解时定义普通函数。

### 导入模块

```python
import json
from pathlib import Path
from package import models

data = json.loads(Path("data.json").read_text(encoding="utf-8"))
user = models.User(**data)
```

避免 `from module import *`。包内代码使用明确的绝对导入或相对导入，不要通过修改 `sys.path` 规避正确的包结构。

### 遍历

```python
for index, value in enumerate(values, start=1):
    print(index, value)

for name, score in zip(names, scores, strict=True):
    print(name, score)
```

`zip(..., strict=True)`（Python 3.10+）会在输入长度不同时抛出 `ValueError`，适合要求数据严格对齐的场景。

### 模式匹配

```python
match response:
    case {"status": 200, "data": data}:
        handle(data)
    case {"status": status} if status >= 400:
        raise RuntimeError(f"request failed: {status}")
    case _:
        raise ValueError("unexpected response")
```

`match`（Python 3.10+）按数据结构匹配，不等同于其他语言的简单 `switch`。

### 参数

```python
def connect(host: str, /, port: int = 443, *, timeout: float = 5.0) -> None:
    ...

connect("example.com", port=8443, timeout=2.0)
```

`/` 左侧只能按位置传递，`*` 右侧只能按关键字传递。默认值在函数定义时求值，不要使用可变对象作为默认值：

```python
def append_item(item: str, values: list[str] | None = None) -> list[str]:
    result = [] if values is None else values
    result.append(item)
    return result
```

### 可变参数与解包

```python
def request(url: str, *segments: str, **options: object) -> None:
    ...

parts = ("users", "42")
settings = {"timeout": 5, "verify": True}
request("https://api.example.com", *parts, **settings)
```

`*args` 收集额外位置参数，`**kwargs` 收集额外关键字参数。公共 API 不应把所有参数无差别塞进 `**kwargs`，否则会降低可读性和类型检查效果。

### 生成器

```python
from collections.abc import Iterator

def read_ids(lines: list[str]) -> Iterator[int]:
    for line in lines:
        if line.strip():
            yield int(line)
```

生成器按需产生值，适合大文件、数据流和管道处理。它只能向前消费一次；需要重复遍历时应重新创建。

### 装饰器

```python
from collections.abc import Callable
from functools import wraps
from typing import ParamSpec, TypeVar

P = ParamSpec("P")
R = TypeVar("R")

def traced(func: Callable[P, R]) -> Callable[P, R]:
    @wraps(func)
    def wrapper(*args: P.args, **kwargs: P.kwargs) -> R:
        print(func.__name__)
        return func(*args, **kwargs)
    return wrapper
```

使用 `functools.wraps()` 保留原函数的名称、文档和签名元数据。

类型标注
---

### 常用标注

```python
from collections.abc import Callable, Iterable, Mapping, Sequence

def normalize(values: Iterable[str]) -> list[str]:
    return [value.strip() for value in values]

def load(config: Mapping[str, object]) -> str | None:
    ...

Handler = Callable[[str], bool]
```

参数只需要遍历时接受 `Iterable[T]`，需要按下标访问时接受 `Sequence[T]`；不要无谓地限制调用方必须传入 `list`。

### 类型收窄

```python
def render(value: int | str) -> str:
    if isinstance(value, int):
        return f"number={value}"
    return value.upper()
```

类型标注默认不在运行时强制校验，应配合静态类型检查器使用。外部输入仍需通过显式校验或数据模型验证。

### Self 与 Protocol

```python
from typing import Protocol, Self

class Closable(Protocol):
    def close(self) -> None: ...

class Builder:
    def option(self, name: str) -> Self:
        return self
```

`Protocol` 用结构化方式描述接口；对象只要满足所需方法即可兼容。`Self`（Python 3.11+）适合返回当前实例或子类实例的方法。

对象模型
---

### dataclass

```python
from dataclasses import dataclass, field

@dataclass(frozen=True, slots=True)
class User:
    name: str
    roles: tuple[str, ...] = field(default_factory=tuple)
```

`dataclass` 自动生成初始化、比较和表示方法。可变默认值使用 `default_factory`；`frozen=True` 表示只读意图，`slots=True` 可减少实例开销。

### 属性与类方法

```python
from typing import Self

class Temperature:
    def __init__(self, celsius: float) -> None:
        self._celsius = celsius

    @property
    def fahrenheit(self) -> float:
        return self._celsius * 9 / 5 + 32

    @classmethod
    def from_fahrenheit(cls, value: float) -> Self:
        return cls((value - 32) * 5 / 9)
```

使用 `property` 暴露计算属性，使用 `classmethod` 实现替代构造器。仅用于当前类的辅助函数可使用 `staticmethod`，但模块级函数通常更直接。

### 常用特殊方法

```python
class Collection:
    def __len__(self) -> int: ...
    def __iter__(self): ...
    def __contains__(self, item: object) -> bool: ...
    def __repr__(self) -> str: ...
```

优先实现与对象语义一致的协议，不要为了“像容器”而堆叠全部魔术方法。`__del__()` 的执行时机不可靠，资源释放应使用上下文管理器。

文件与数据
---

### pathlib

```python
from pathlib import Path

root = Path("data")
root.mkdir(parents=True, exist_ok=True)

config = root / "config.json"
text = config.read_text(encoding="utf-8")

for path in root.glob("**/*.json"):
    print(path.name, path.stat().st_size)
```

新代码优先使用 `pathlib.Path` 组合和操作路径，避免手动拼接 `/` 或 `\\`。底层系统接口仍可使用 `os`、`shutil` 和 `glob`。

### 文件与上下文管理器

```python
with open("input.txt", encoding="utf-8") as source:
    for line_number, line in enumerate(source, start=1):
        print(line_number, line.rstrip())
```

`with` 会在成功或异常退出时关闭资源。文本文件显式指定编码；二进制文件使用 `"rb"` / `"wb"`。

### JSON 与 TOML

```python
import json
import tomllib
from pathlib import Path

data = json.loads('{"enabled": true}')
Path("data.json").write_text(
    json.dumps(data, ensure_ascii=False, indent=2),
    encoding="utf-8",
)

with open("pyproject.toml", "rb") as file:
    project = tomllib.load(file)
```

`tomllib`（Python 3.11+）只负责读取 TOML。不要用 `pickle` 读取不可信数据，它可以执行任意代码。

### 时间

```python
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

now = datetime.now(timezone.utc)
local = now.astimezone(ZoneInfo("Asia/Shanghai"))
iso = local.isoformat()
parsed = datetime.fromisoformat(iso)
```

跨系统存储和传输时间时使用带时区的 `datetime`，通常存 UTC；展示时再转换到目标 `ZoneInfo` 时区。

错误处理
---

### 捕获异常

```python
try:
    value = int(text)
except ValueError as error:
    raise ValueError(f"invalid integer: {text!r}") from error
else:
    use(value)
finally:
    cleanup()
```

只捕获能够处理的具体异常。避免裸 `except:` 和吞掉异常；需要补充上下文时使用 `raise ... from error` 保留异常链。

### 自定义异常

```python
class ConfigError(ValueError):
    """配置值无效。"""

def require_port(value: int) -> int:
    if not 1 <= value <= 65535:
        raise ConfigError(f"invalid port: {value}")
    return value
```

业务异常通常继承最贴近语义的标准异常；仅在调用方需要单独捕获时创建新类型。

标准库工具
---

### collections 与 itertools

```python
from collections import Counter, defaultdict, deque
from itertools import chain, islice

counts = Counter(words)
groups: defaultdict[str, list[int]] = defaultdict(list)
queue = deque(["first", "second"])

head = list(islice(stream, 10))
combined = chain(first_iterable, second_iterable)
```

频率统计使用 `Counter`，分组使用 `defaultdict`，双端队列使用 `deque`。迭代器组合优先考虑 `itertools`，避免先构造大型中间列表。

### 日志

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)
logger.info("processed %d records", count)
```

库代码不要调用 `basicConfig()`；由应用入口配置日志。日志参数使用惰性 `%` 占位，避免在禁用该级别时提前格式化。

### 命令行参数

```python
import argparse

parser = argparse.ArgumentParser()
parser.add_argument("path")
parser.add_argument("--limit", type=int, default=100)
parser.add_argument("--verbose", action="store_true")
args = parser.parse_args()
```

简单脚本使用标准库 `argparse` 即可；参数数量很多时使用子命令和共享父解析器整理结构。

并发
---

### 选择模型

任务 | 工具
:- | :-
大量异步网络 I/O | `asyncio`
阻塞 I/O、同步第三方库 | `ThreadPoolExecutor`
CPU 密集型纯 Python 计算 | `ProcessPoolExecutor`
生产者/消费者传递数据 | `queue.Queue` / `asyncio.Queue`
<!--rehype:className=show-header-->

线程不等于自动加速 CPU 密集型 Python 代码。跨进程传参需要可序列化，进程入口应放在 `if __name__ == "__main__":` 保护中。

### Executor

```python
from concurrent.futures import ThreadPoolExecutor

with ThreadPoolExecutor(max_workers=8) as executor:
    results = list(executor.map(fetch, urls))
```

`executor.map()` 保持输入顺序；需要按完成顺序处理或单独捕获异常时，使用 `submit()` 配合 `as_completed()`。

### asyncio 与 TaskGroup

```python
import asyncio

async def main() -> None:
    async with asyncio.TaskGroup() as group:
        first = group.create_task(fetch("/users"))
        second = group.create_task(fetch("/posts"))

    print(first.result(), second.result())

asyncio.run(main())
```

`TaskGroup`（Python 3.11+）在退出上下文时等待全部任务；一个任务失败时会取消其余任务并汇总异常。不要在协程中调用阻塞 I/O，可用异步客户端或 `asyncio.to_thread()` 包装阻塞函数。


<!--rehype:className=show-header-->

另见
---

- [Python 官方文档](https://docs.python.org/3/) _(docs.python.org)_
- [Python 教程](https://docs.python.org/3/tutorial/) _(docs.python.org)_
- [Python 标准库](https://docs.python.org/3/library/) _(docs.python.org)_
- [Python 环境与包管理](./conda.md)
- [FastAPI](./fastapi.md)
