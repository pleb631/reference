SQLite 备忘清单
===

本页汇总 [SQLite](https://sqlite.org/) 的常用命令和 SQL 语句，便于快速查阅。

入门
---

### 介绍

SQLite 是一个轻量级的嵌入式关系数据库管理系统，遵循 ACID 原则，广泛用于浏览器、操作系统等应用中，实现本地数据存储。

### 安装
<!--rehype:wrap-class=col-span-2 row-span-2-->

#### Windows

- 从 [SQLite 下载页](https://www.sqlite.org/download.html) 下载与系统架构匹配的 `sqlite-tools-win-*.zip`。
- 解压到例如 `C:\sqlite` 的目录；其中包含 `sqlite3.exe`。
- 将该目录添加到 `PATH`，然后在终端运行 `sqlite3 --version` 验证安装。
<!--rehype:className=style-timeline-->

#### Linux

使用发行版的包管理器安装：

```bash
# Debian / Ubuntu
sudo apt install sqlite3

# Fedora / RHEL
sudo dnf install sqlite
```

#### macOS

```bash
brew install sqlite
```

### 连接 SQLite 数据库

SQLite 通常无需复杂配置，当指定的数据库文件不存在时，它会自动创建一个新文件。

```bash
sqlite3 mydatabase.db
```

若数据库文件不存在则会自动创建

数据库操作
---

### 显示数据库名称及对应文件

```shell
sqlite> .databases
main: /home/user/sqlite/database.db r/w
```

### 备份数据库

```shell
sqlite> .backup back
```

### 显示已经设置的值
<!--rehype:wrap-class=row-span-3-->

```shell
sqlite> .show 
        echo: off
         eqp: off
     explain: auto
     headers: off
        mode: list
   nullvalue: ""
      output: stdout
colseparator: "|"
rowseparator: "\n"
       stats: off
       width:
    filename: api.db
```

### 备份单张表

```shell
sqlite> .dump user
```

### 退出

```shell
sqlite> .exit
```

### 以 sql 的形式 dump 数据库
<!--rehype:wrap-class=col-span-2-->

```shell
sqlite> .dump
PRAGMA foreign_keys=OFF;
BEGIN TRANSACTION;
CREATE TABLE api (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    host TEXT NOT NULL,
    port INTEGER NOT NULL,
    path TEXT NOT NULL
);
INSERT INTO api VALUES(1,'example.com',8080,'/api/v1');
```

### 导入与导出数据库

#### 导出数据库
<!--rehype:style=text-align: left;-->

```bash
sqlite3 mydatabase.db .dump > backup.sql
```

#### 导入数据库
<!--rehype:style=text-align: left;-->

```bash
sqlite3 mydatabase.db < backup.sql
```

### 输出模式设置
<!--rehype:wrap-class=col-span-2-->

#### 设置输出模式为 csv

```sh
sqlite> .mode csv
sqlite> select * from api;
id,host,port,path
1,example.com,8080,/api/v1
```

#### 输出为 markdown

```sh
sqlite> select * from api;
| id |      host       | port |  path   |
|----|-----------------|------|---------|
| 1  | example.com     | 8080 | /api/v1 |
```

支持 ascii box column csv html insert json line list markdown qbox quote table tabs tcl 等类型

数据表操作
---

### 常用表操作

#### 创建表
<!--rehype:style=text-align: left;color: var(--primary-color);-->

```sh
sqlite> create table user(id integer primary key, name text);
```
<!--rehype:className=wrap-text-->

#### 查看所有表
<!--rehype:style=text-align: left;color: var(--primary-color);-->

```sh
sqlite> .tables
```

#### 查看表结构
<!--rehype:style=text-align: left;color: var(--primary-color);-->

```sh
sqlite> .schema user
```

#### 导入文件到表中
<!--rehype:style=text-align: left;color: var(--primary-color);-->

```sh
sqlite> .import user.csv user
```

#### 设置查询显示列名称
<!--rehype:style=text-align: left;color: var(--primary-color);-->

```sh
sqlite> .head on
```

### 常用 SQL
<!--rehype:wrap-class=col-span-2 row-span-2-->

```sql
-- 创建表
create table user(id integer primary key, name text);

-- 删除表
drop table user;

-- 重命名表
alter table user rename to user_new;

-- 插入
-- 单条
insert into user(name) values('test');
-- 多条
insert into user(name) values('test1'),('test2');

-- 查询
select * from user;
-- 去重查询
select distinct name from user;
-- 统计
select count(id) from user;
-- limit
select * from user limit 2;
-- 条件查询
select * from user where id > 1;
-- 模糊查询
select * from user where name like '%test%';
-- group by
select name, count(id) from user group by name;
-- 排序
select * from user order by id desc;
-- 聚合函数
select max(id) from user;

-- 更新
update user set name='test3' where id=1;

-- 删除
delete from user where id=1;
```

### 事务支持

**事务**具有原子性(Atomicity)、一致性(Consistency)、隔离性(Isolation)、持久性(Durability)四个标准属性，缩写为 ACID。

```sql
-- 开始事务
begin transaction;
-- 操作
update user set name='test4' where id=1;
-- 回滚
rollback;
-- 提交
commit;
```

### 命令行帮助
<!--rehype:wrap-class=col-span-3-->

|命令|描述|
|:---|:---|
|.backup ?DB? FILE   |备份 DB 数据库（默认是 "main"）到 FILE 文件。|
|.bail ON\|OFF       |发生错误后停止。默认为 OFF。|
|.databases           |列出数据库的名称及其所依附的文件。
|.dump ?TABLE?       |以 SQL 文本格式转储数据库。如果指定了 TABLE 表，则只转储匹配 LIKE 模式的 TABLE 表。
|.echo ON\|OFF       |开启或关闭 echo 命令。
|.exit               |退出 SQLite 提示符。
|.explain ON\|OFF     |开启或关闭适合于 EXPLAIN 的输出模式。如果没有带参数，则为 EXPLAIN on，即开启 EXPLAIN。
|.header(s) ON\|OFF   |开启或关闭头部显示。
|.help               |显示消息。
|.import FILE TABLE   |导入来自 FILE 文件的数据到 TABLE 表中。
|.indices ?TABLE?     |显示所有索引的名称。如果指定了 TABLE 表，则只显示匹配 LIKE 模式的 TABLE 表的索引。
|.load FILE ?ENTRY?   |加载一个扩展库。
|.log FILE\|off       |开启或关闭日志。FILE 文件可以是 stderr（标准错误）/stdout（标准输出）。
|.nullvalue STRING   |在 NULL 值的地方输出 STRING 字符串。
|.output FILENAME     |发送输出到 FILENAME 文件。
|.output stdout       |发送输出到屏幕。
|.print STRING...     |逐字地输出 STRING 字符串。
|.prompt MAIN CONTINUE  |替换标准提示符。
|.quit               |退出 SQLite 提示符。
|.read FILENAME       |执行 FILENAME 文件中的 SQL。
|.schema ?TABLE?     |显示 CREATE 语句。如果指定了 TABLE 表，则只显示匹配 LIKE 模式的 TABLE 表。
|.separator STRING   |改变输出模式和 .import 所使用的分隔符。
|.show               |显示各种设置的当前值。
|.stats ON\|OFF       |开启或关闭统计。
|.tables ?PATTERN?   |列出匹配 LIKE 模式的表的名称。
|.timeout MS         |尝试打开锁定的表 MS 毫秒。
|.width NUM          |NUM  为 "column" 模式设置列宽度。
|.timer ON\|OFF       |开启或关闭 CPU 定时器。
|.mode MODE           | 设置输出模式，MODE 可以是下列之一 `:csv` 逗号分隔的值 <br/>column 左对齐的列 <br/>html HTML 的 \<table\> 代码 <br/>insert TABLE 表的 SQL 插入（insert）语句 <br/>line 每行一个值 <br/>list 由 .separator 字符串分隔的值 <br/>tabs 由 Tab 分隔的值 <br/> tcl TCL 列表元素<br/>
<!--rehype:className=left-align-->

在命令行中通过 `.help` 命令显示帮助文档

另见
--------
- [菜鸟教程](https://www.runoob.com/sqlite/sqlite-tutorial.html)
- [SQLite 官方文档](https://www.sqlite.org/docs.html) _(sqlite.org)_
