7zip 备忘清单
====

7z（7-Zip / p7zip）命令用于创建、更新、查看与解压压缩包，常见格式包括 `7z`、`zip`、`tar` 等。

入门
----

### 7z 用法

```shell
$ 7z <命令> [<开关>..] <压缩包名称> [<文件名>..]
```
<!--rehype:className=wrap-text-->

常见命令：

- `a` 添加文件到压缩包（创建/追加）
- `x` 解压（保留完整路径）
- `e` 解压（不保留目录结构）
- `l` 列出压缩包内容
- `t` 测试压缩包完整性

安装：

```shell
# Debian/Ubuntu
$ sudo apt install p7zip-full

# RHEL/CentOS/Fedora
$ sudo yum install p7zip p7zip-plugins

# macOS (Homebrew)
$ brew install sevenzip
```

### 命令
<!--rehype:wrap-class=col-span-2-->

参数 | 描述 | 参数 | 描述
:--- | :--- | :--- | :---
`a` | **add：** 添加/创建压缩包 | `x` | **extract：** 解压（保留完整路径）
`e` | **extract：** 解压（不保留目录名） | `l` | **list：** 列出压缩包内容
`t` | **test：** 测试压缩包完整性 | &nbsp; | &nbsp;

### 语法形式和选项

:- | :-
:- | :-
**基本语法** | `7z <命令> [开关...] 压缩包 [文件...]`
**创建 7z 压缩包** | `7z a -t7z archive.7z 文件/目录...`
**创建 zip 压缩包** | `7z a -tzip archive.zip 文件/目录...`
**解压（保留路径）** | `7z x archive.7z -o输出目录`
**解压（不保留目录）** | `7z e archive.7z -o输出目录`
**列出内容** | `7z l archive.7z`
**测试完整性** | `7z t archive.7z`
**创建分卷压缩包** | `7z a archive.7z 大文件.iso -v1g`
<!--rehype:className=style-list-arrow-->

### 常用开关示例
<!--rehype:wrap-class=col-span-2 row-span-1-->

参数 | 描述 | 参数 | 描述
:--- | :--- | :--- | :---
`--` | 停止解析后续参数为开关 | `-t{Type}` | 指定压缩格式（如 `-t7z` / `-tzip`），默认为`7z`
`-o{目录}` | 指定输出目录（解压） | `-p{密码}` | 设置密码
`-r[-\|0]` | 递归子目录（`-r` / `-r-` / `-r0`） | `-mx[N]` | 压缩等级：`-mx0`（不压缩） `-mx1`（最快）… `-mx9`（最强）
`-mmt[N]` | 线程数（如 `-mmt4`） | `-y` | 所有询问默认回答 Yes
`-ao{a\|s\|t\|u}` | 覆盖策略：a 全覆盖 / s 跳过 / t 仅覆盖旧文件 / u 自动重命名 | &nbsp; | &nbsp;
`-v{Size}[b\|k\|m\|g]` | 分卷（如 `-v1g` / `-v500m`） | &nbsp; | &nbsp;
`-i...` | 仅包含匹配项（include） | `-x...` | 排除匹配项（exclude）

7z 压缩示例
--------

### 创建新的 7z 压缩包

```shell
$ 7z a -t7z archive.7z file1 file2 dir1/
```

### 创建分卷压缩包

```shell
$ 7z a big.7z big.iso -v1g
```

压缩时会自动根据文件名后缀判断压缩格式，所以可以忽略 `-t` 开关

### 设置压缩等级与线程数

```shell
$ 7z a archive.7z dir1/ -mx9 -mmt4
```

### 排除目录或文件
<!--rehype:wrap-class=col-span-2-->

```shell
$ 7z a archive.7z example/ '-x!example/node_modules/*' '-x!example/dist/*'
```
<!--rehype:className=wrap-text-->

7z 解压示例
--------

### 解压并保留目录结构（推荐）

```shell
$ 7z x archive.7z
```

### 解压到指定目录

```shell
$ 7z x archive.7z -o./output
```

### 解压但不保留目录结构

```shell
$ 7z e archive.7z -o./output
```

### 解压时覆盖策略

```shell
$ 7z x archive.7z -o./output -aoa
```

### 仅解压匹配的文件

```shell
$ 7z x archive.7z '*.log' -o./output
```

### 列出压缩包内容（含技术信息）

```shell
$ 7z l archive.7z -slt
```

### 测试压缩包完整性

```shell
$ 7z t archive.7z
```

### 计算文件哈希（SHA256）

```shell
$ 7z h -scrcSHA256 file1 file2
```

另见
----

- [7-Zip 官网](https://www.7-zip.org/) _(7-zip.org)_
- [7-Zip 简体中文网站](https://sparanoid.com/lab/7z/) _(7-zip.org)_
- [7z 命令帮助文档](https://jaywcjlove.github.io/linux-command/c/7z.html) _(linux-command)_
