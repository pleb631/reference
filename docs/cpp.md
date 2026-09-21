C++ 备忘清单
===

整理现代 [C++](https://zh.cppreference.com/) 常用写法、资源管理、智能指针与并发工具的快速参考备忘单。

核心类型与容器
------------

### 值、引用与指针
<!--rehype:wrap-class=col-span-2-->

```cpp
int value{42};
int copy{value};       // 独立副本
int& reference{value}; // 引用同一对象，不可为空
int* pointer{&value};  // 保存地址，可以为空

reference = 10;
if (pointer != nullptr) {
    *pointer = 20;
}
```

形式 | 含义 | 常见用途
:- | :- | :-
`T value` | 拥有一个值 | 小型对象、需要副本
`T& value` | 可修改引用 | 修改调用方对象
`const T& value` | 只读引用 | 避免复制大型对象
`T* value` | 可空指针 | 可选对象、数组或底层接口
<!--rehype:className=show-header-->

对象所有权优先交给值类型、容器和智能指针；裸指针通常只表示非拥有访问。

### 常用容器

```cpp
#include <array>
#include <map>
#include <string>
#include <unordered_map>
#include <vector>

std::array<int, 3> fixed{1, 2, 3};
std::vector<int> values{1, 2, 3};
std::map<std::string, int> ordered{{"a", 1}};
std::unordered_map<std::string, int> lookup{{"a", 1}};
```

容器 | 特点
:- | :-
`std::array<T, N>` | 固定长度、连续内存
`std::vector<T>` | 动态长度、连续内存，默认序列容器
`std::map<K, V>` | 键有序，查找通常为 O(log n)
`std::unordered_map<K, V>` | 哈希表，平均常数时间查找
<!--rehype:className=show-header-->

### 遍历与算法

```cpp
#include <algorithm>
#include <ranges>
#include <vector>

std::vector<int> values{4, 1, 3, 2};

for (const int value : values) {
    use(value);
}

std::ranges::sort(values);
auto found = std::ranges::find(values, 3);
bool has_even = std::ranges::any_of(values, [](int value) {
    return value % 2 == 0;
});
```

优先使用基于范围的 `for` 和标准算法。只读大型元素时使用 `const auto&`，需要修改元素时使用 `auto&`。

### struct 与 class

```cpp
struct Point {
    double x{};
    double y{};
};

class Counter {
public:
    explicit Counter(int initial) : value_{initial} {}

    void increment() { ++value_; }
    [[nodiscard]] int value() const { return value_; }

private:
    int value_{};
};
```

`struct` 默认成员为 `public`，适合简单数据对象；`class` 默认成员为 `private`，适合维护不变量和封装行为。多态基类的析构函数应声明为 `virtual`。

C++ 函数
------------

### 参数与返回值

```cpp
void consume(std::string value);             // 按值接收并取得副本
void update(Settings& settings);             // 修改调用方对象
void inspect(const Settings& settings);      // 只读且避免复制
Widget* find_widget(int id);                  // 可以返回 nullptr
std::optional<Widget> load_widget(int id);   // 显式表达“可能没有值”
```

小型标量通常按值传递；大型只读对象使用 `const T&`；确实需要修改调用方时使用 `T&`。返回对象时优先按值返回，让编译器执行返回值优化或移动。

### 默认参数与重载

```cpp
void log(std::string_view message, LogLevel level = LogLevel::info);

void print(int value);
void print(std::string_view value);
```

默认参数应从参数列表末尾开始，并通常只写在声明中。重载函数应保持相同语义，避免仅靠容易混淆的隐式转换区分。

### Lambda 表达式
<!--rehype:wrap-class=col-span-2-->

Lambda 表达式可以在函数内定义，可以理解为在函数内定义的临时函数。格式：

```cpp
auto func = []() -> return_type { };
```

- `[]`为捕获列表，能够捕获其所在函数的局部变量
  - 一个空的捕获列表代表Lambda表达式不捕获任何的变量
  - 对于值捕获，直接在中括号中填写要捕获的变量即可：

      ```cpp
      int val = 5;
      auto func = [val]() -> return_type { };
      ```

- 对于引用捕获，需要在捕获的变量前添加`&`：

  ```cpp
  string str("hello world!");
  auto func = [&str]() -> return_type { };
  ```

- 如果变量太多，需要编译器根据我们编写的代码自动捕获，可以采用隐式捕获的方式。

  - 全部值捕获：

      ```cpp
      int val1, val2;
      auto func = [=]() -> int
          {
              return val1 + val2;
          };
      ```

  - 全部引用捕获：

      ```cpp
      string str1("hello"), str2("word!");
      auto func = [&]() -> string
          {
              return str1 + str2;
          };
      ```

  - 混合隐式捕获：

      如果希望对一部分变量采用值捕获，对其他变量采用引用捕获，可以混合使用：

      ```cpp
      int val1 = 123, val2 = 456;
      string str1("123"), str2(456);
      
      auto func1 = [=, &str1]() -> int
          {
              return   val1 == std::stoi(str1)
                    ? val1 : val2;
          };
      
      auto func2 = [&, val1]() -> string
          {
              return   str1 == std::to_string(val1)
                    ? str1 : str2;
          };
      ```

- `()` 是参数列表，我们只需要按照普通函数的使用方法来使用即可
- `return_type` 是函数的返回类型，`-> return_type` 可以不写，编译器会自动推导
- `{}` 中的内容就是函数体，依照普通函数的使用方法使用即可
<!--rehype:className=style-timeline-->

此处给出一个 Lambda 表达式的实际使用例子(当然可以使用 `str::copy`):

```cpp
// vec中包含1, 2, 3, 4, 5
std::vector<int> vec({1, 2, 3, 4, 5});
std::for_each(vec.begin(), vec.end(),
              [](int& ele) -> void
          {
              std::cout << ele
                          << " ";
          });
```

现代 C++ 基础
------------

### 列表初始化

```cpp
int count{2};
double ratio{0.5};

// int value{2.5}; // 错误：禁止窄化转换
int value = 2.5;   // 允许，但会丢失小数部分
```

花括号初始化适用于内置类型、容器和自定义类型，并能在编译期阻止部分窄化转换。

### 强类型枚举

```cpp
enum class Status : unsigned char {
    idle,
    running,
    stopped
};

Status status{Status::running};
auto value = static_cast<unsigned char>(status);
```

`enum class` 不会把枚举项注入外层作用域，也不会隐式转换成整数。需要数值时使用 `static_cast`。

### const、constexpr 与 consteval
<!--rehype:wrap-class=row-span-2-->

```cpp
const int runtime_value = read_value();
constexpr int size = 4 * 8;

constexpr int square(int value) {
    return value * value;
}

consteval int checked_size(int value) {
    return value > 0 ? value : 1;
}

static_assert(square(4) == 16);
constexpr int buffer_size = checked_size(64);
```

- `const` 表示对象初始化后不可修改，值可在运行期确定。
- `constexpr` 表示值或函数可以参与常量表达式，也可在运行期调用。
- `consteval`（C++20）要求每次调用都在编译期求值。

### auto 与 decltype

```cpp
int value{10};
const int limit{20};
int& reference{value};

auto copy = reference;          // int
decltype(reference) alias = value; // int&
decltype(limit) fixed = 30;     // const int
decltype((value)) ref = value;  // int&
```

`auto` 常用于从初始化器推导变量类型；`decltype` 获取表达式类型，并保留 `const` 与引用信息。对变量加括号后，`decltype((变量))` 通常得到引用类型。

### 显式类型转换

```cpp
double input{3.14};
int truncated = static_cast<int>(input);

enum class Mode { read, write };
int raw = static_cast<int>(Mode::write);

Base* base = get_object();
if (auto* derived = dynamic_cast<Derived*>(base)) {
    derived->run();
}
```

`static_cast` 用于已知且受语言规则支持的转换；多态类向下转换需要运行期检查时使用 `dynamic_cast`。避免用 C 风格转换隐藏转换意图。

字符串与输出
------------

### string_view（C++17）

```cpp
#include <string_view>

bool has_prefix(std::string_view text) {
    return text.starts_with("ref-"); // C++20
}

std::string_view view{"hello world"};
view.remove_prefix(6);
```

`std::string_view` 是不拥有字符数据的只读视图，传参时可避免复制。原字符串销毁或重新分配后，已有视图可能悬空。

### print 与 println（C++23）

```cpp
#include <print>

std::print("name={}, score={}", "Ada", 98);
std::println("result={:.2f}", 3.14159);
```

`std::print()` 不自动换行，`std::println()` 会在格式化结果后追加换行。两者使用与 `std::format` 相同的格式字符串语法。

### 返回多个值

```cpp
struct ParseResult {
    std::string name;
    int value;
};

ParseResult parse() {
    return {"port", 8080};
}

auto [name, value] = parse();
```

字段有明确含义时优先返回结构体；临时组合也可返回 `std::pair` 或 `std::tuple`，并用结构化绑定解包。

资源与对象语义
--------------

### RAII

```cpp
#include <fstream>
#include <mutex>

std::ofstream output{"result.txt"};

std::mutex mutex;
{
    std::lock_guard lock{mutex};
    output << "protected\n";
} // 自动解锁；output 离开作用域时自动关闭文件
```

RAII 将资源生命周期绑定到对象生命周期：构造时获取资源，析构时释放。标准流、容器、智能指针和锁管理器都遵循这一模式。

### Rule of Zero / Five

```cpp
class Buffer {
public:
    Buffer(const Buffer&) = delete;
    Buffer& operator=(const Buffer&) = delete;

    Buffer(Buffer&&) noexcept = default;
    Buffer& operator=(Buffer&&) noexcept = default;

private:
    std::unique_ptr<char[]> data_;
};
```

优先用标准容器和智能指针管理资源，让编译器生成析构、拷贝和移动操作，即 Rule of Zero。必须直接管理资源时，应一并考虑析构函数、拷贝构造、拷贝赋值、移动构造和移动赋值，即 Rule of Five。

## C++智能指针

### 智能指针基础
<!--rehype:wrap-class=row-span-2-->

```cpp
#include <memory>

// 创建独占所有权的指针
std::unique_ptr<int> p1 = std::make_unique<int>(42);
// 不能复制，只能移动
std::unique_ptr<int> p2 = std::move(p1);
// p1 现在为 nullptr

// 创建共享所有权的指针
std::shared_ptr<int> sp1 = std::make_shared<int>(42);
// 可以复制，引用计数增加
std::shared_ptr<int> sp2 = sp1;
// 获取引用计数
std::cout << sp1.use_count(); // 输出: 2

// 创建弱引用，不增加引用计数
std::weak_ptr<int> wp = sp1;
```

### unique_ptr

```cpp
// 创建方式1：使用 make_unique (C++14)
auto p1 = std::make_unique<int>(42);

// 创建方式2：直接构造
std::unique_ptr<int> p2(new int(42));

// 访问资源
std::cout << *p1 << std::endl;
*p1 = 100;

// 获取原始指针（不转移所有权）
int* raw = p1.get();

// 释放所有权并返回原始指针
int* released = p1.release();
// p1 现在为 nullptr

// 替换管理的对象
p1.reset(new int(50));
```

### shared_ptr

```cpp
// 创建方式1：使用 make_shared
auto sp1 = std::make_shared<int>(42);

// 创建方式2：直接构造
std::shared_ptr<int> sp2(new int(42));

// 复制和共享所有权
std::shared_ptr<int> sp3 = sp1;
std::cout << sp1.use_count(); // 输出: 2

// 访问资源
std::cout << *sp1 << std::endl;
*sp1 = 100; // 所有指向该资源的shared_ptr都会看到这个修改

// 重置指针
sp1.reset(); // sp1变为nullptr，引用计数减1
```

### weak_ptr

```cpp
std::shared_ptr<int> sp = std::make_shared<int>(42);
std::weak_ptr<int> wp = sp;

// 检查引用对象是否存在
if (auto locked = wp.lock()) {
    std::cout << *locked << std::endl; // 输出: 42
} else {
    std::cout << "对象已被销毁" << std::endl;
}

// 检查是否过期
bool is_expired = wp.expired(); // false

// 获取引用计数
std::cout << wp.use_count(); // 输出: 1

// 当所有shared_ptr都被销毁时
sp.reset();
if (wp.expired()) {
    std::cout << "对象已被销毁" << std::endl;
}
```

### 循环引用问题

```cpp
struct Node {
    std::string name;
    std::shared_ptr<Node> next;
    // 使用weak_ptr避免循环引用
    std::weak_ptr<Node> parent;
    
    Node(const std::string& n) : name(n) {}
    ~Node() { std::cout << "销毁: " << name << std::endl; }
};

// 创建循环引用
void createCycle() {
    auto node1 = std::make_shared<Node>("Node1");
    auto node2 = std::make_shared<Node>("Node2");
    
    node1->next = node2;
    node2->parent = node1; // 使用weak_ptr避免循环引用
    
    // 函数结束时，node1和node2会被正确销毁
    // 如果parent也是shared_ptr，则会造成内存泄漏
}
```

## C++多线程

### 多线程介绍

g++编译选项：`-std=c++11`。包含头文件：

- `#include <thread>`：C++多线程库
- `#include <mutex>`：C++互斥量库
- `#include <future>`：C++异步库

### 线程的创建
<!--rehype:wrap-class=row-span-2-->

以普通函数作为线程入口函数：

```cpp
void entry_1() { }
void entry_2(int val) { }

std::thread my_thread_1(entry_1);
std::thread my_thread_2(entry_2, 5);
```

以类对象作为线程入口函数：

```cpp
class Entry
{
    void operator()() { }
    void entry_function() { }
};

Entry entry;
// 调用operator()()
std::thread my_thread_1(entry);
// 调用Entry::entry_function
std::thread my_thread_2(&Entry::entry_function, &entry);
```

以lambda表达式作为线程入口函数：

```cpp
std::thread my_thread([]() -> void
      {
         // ...
      });
```

### 线程的销毁

```cpp
thread my_thread;
// 阻塞
my_thread.join();
// 非阻塞
my_thread.detach();
```

### `this_thread`

```cpp
// 获取当前线程ID
std::this_thread::get_id();
// 使当前线程休眠一段指定时间
std::this_thread::sleep_for();
// 使当前线程休眠到指定时间
std::this_thread::sleep_until();
// 暂停当前线程的执行，让别的线程执行
std::this_thread::yield();
```

### 锁
<!--rehype:wrap-class=row-span-5-->

> `#include <mutex>`

#### 锁的基本操作

创建锁

```cpp
std::mutex m;
```

上锁

```cpp
m.lock();
```

解锁

```cpp
m.unlock();
```

尝试上锁：成功返回`true`，失败返回`false`

```cpp
m.try_lock();
```

解锁

```cpp
m.unlock();
```

#### 更简单的锁 —— `std::lock_guard<Mutex>`

构造时上锁，析构时解锁

```cpp
std::mutex m;
std::lock_guard<std::mutex> lock(m);
```

额外参数：`std::adopt_lock`：只需解锁，无需上锁

```cpp
// 手动上锁
m.lock();
std::lock_guard<mutex> lock(m,
    std::adopt_lock);
```

#### `unique_lock<Mutex>`

构造上锁，析构解锁

```cpp
std::mutex m;
std::unique_lock<mutex> lock(m);
```

##### `std::adopt_lock`

只需解锁，无需上锁

```cpp
// 手动上锁
m.lock();
std::unique_lock<mutex> lock(m,
    std::adopt_lock);
```

##### `std::try_to_lock`

尝试上锁，可以通过`std::unique_lock<Mutex>::owns_lock()`查看状态

```cpp
std::unique_lock<mutex> lock(m,
    std::try_to_lock);
if (lock.owns_lock())
{
    // 拿到了锁
}
else
{
    // 没有
}
```

##### `std::defer_lock`

绑定锁，但不上锁

```cpp
std::unique_lock<mutex> lock(m,
    std::defer_lock);
lock.lock();
lock.unlock();
```

##### `std::unique_lock<Mutex>::release`

返回所管理的`mutex`对象指针，**释放所有权。**一旦释放了所有权，那么如果原来互斥量处于互斥状态，程序员有责任手动解锁。

#### `std::call_once`

当多个线程通过这个函数调用一个可调用对象时，只会有一个线程成功调用。

```cpp
std::once_flag flag;

void foo() { }

std::call_once(flag, foo);
```

### `std::condition_variable`

#### 创建条件变量

```cpp
std::condition_variable cond;
```

#### 等待条件变量被通知

```cpp
std::unique_lock<std::mutex>
    lock;
extern bool predicate();

// 调用方式 1
cond.wait(lock);
// 调用方式 2
cond.wait(lock, predicate);
```

----

- `wait`不断地尝试重新获取并加锁该互斥量，如果获取不到，它就卡在这里并反复尝试重新获取，如果获取到了，执行流程就继续往下走
- `wait`在获取到互斥量并加锁了互斥量之后：
  - 如果`wait`被提供了可调用对象，那么就执行这个可调用对象：
    - 如果返回值为`false`，那么`wait`继续加锁，直到再次被 notified
    - 如果返回值为`true`，那么`wait`返回，继续执行流程
  - 如果`wait`没有第二个参数，那么直接返回，继续执行

#### `std::condition_variable::notify_one`

`notify_one` 唤醒一个调用 `wait` 的线程。注意在唤醒之前要解锁，否则调用 `wait` 的线程也会因为无法加锁而阻塞。

#### `std::condition_variable::notify_all`

唤醒所有调用 `wait` 的线程。

### 获取线程的运行结果
<!--rehype:wrap-class=row-span-5-->

> `#include <future>`

#### 创建异步任务

```cpp
double func(int val);

// 使用std::async创建异步任务
// 使用std::future获取结果
// future模板中存放返回值类型
std::future<double> result =
    std::async(func, 5);
```

#### 获取异步任务的返回值

等待异步任务结束，但是不获取返回值：

```cpp
result.wait();
```

获取异步任务的返回值：

```cpp
int val = result.get();
```

注：

- `get()`返回右值，因此只可调用一次
- 只要调用上述任意函数，线程就会一直阻塞到返回值可用（入口函数运行结束）

#### `std::async` 的额外参数

额外参数可以被放在 `std::async` 的第一个参数位置，用于设定 `std::async` 的行为：

- `std::launch::deferred`：入口函数的运行会被推迟到`std::future<T>::get()`或者`std::future<T>::wait()`被调用时。此时调用线程会直接运行线程入口函数，换言之，**不会创建子线程**
- `std::launch::async`：立即创建子线程，并运行线程入口函数
- `std::launch::deferred | std::launch::async`：默认值，由系统自行决定

#### 返回值的状态

让当前线程等待一段时间（等待到指定时间点），以期待返回值准备好：

```cpp
extern double foo(int val) {}

std::future<double> result =
    std::async(foo, 5);

//返回值类型
std::future_status status;
// 等待一段时间
status = result.wait_for(
  std::chrono::seconds(1)
  );
// 等待到某一时间点
status = result.wait_until(
  std::chrono::now() +
    std::chrono::seconds(1)
  );
```

在指定的时间过去后，可以获取等待的结果：

```cpp
// 返回值已经准备好
if (status ==
     std::future_status::ready)
{

}
// 超时：尚未准备好
else if (status ==
    std::future_status::timeout)
{ }
// 尚未启动: std::launch::deferred
else if (status ==
    std::future_status::deferred)
{ }
```

#### 多个返回值

如果要多次获取结果，可以使用`std::shared_future`，其会返回结果的一个**拷贝**。

```cpp
std::shared_future<T> result;
```

对于不可拷贝对象，可以在`std::shared_future`中存储对象的指针，而非指针本身。

基础语法速查
------------

### 分支与循环

```cpp
if (score >= 90) {
  grade = 'A';
} else if (score >= 60) {
  grade = 'P';
} else {
  grade = 'F';
}

for (const auto& item : items) {
  if (!item.valid()) continue;
  process(item);
}

for (std::size_t i = 0; i < items.size(); ++i) {
  use(i, items[i]);
}
```

只读遍历使用 `const auto&` 避免拷贝；需要修改元素时使用 `auto&`，小型标量值则可直接按值遍历。

### switch

```cpp
switch (status) {
  case Status::ready:
    start();
    break;
  case Status::stopped:
    cleanup();
    break;
  default:
    report_unknown();
    break;
}
```

`case` 默认会继续执行下一个分支。需要刻意贯穿时标注 `[[fallthrough]]`（C++17），否则使用 `break` 或 `return`。

### 预处理与编译条件

```cpp
#pragma once

#include <string>
#include "project/config.hpp"

#if defined(_WIN32)
constexpr char path_separator = '\\\\';
#else
constexpr char path_separator = '/';
#endif
```

优先使用 `constexpr`、函数、模板和强类型枚举替代宏。宏没有类型与作用域，仅在条件编译或必须的预处理场景使用。

另见
----

- [C++ Infographics & Cheat Sheets](https://hackingcpp.com/cpp/cheat_sheets.html) _(hackingcpp.com)_
- [C++ reference](https://zh.cppreference.com/w/) _(cppreference.com)_
- [C++ Language Tutorials](http://www.cplusplus.com/doc/tutorial/) _(cplusplus.com)_
