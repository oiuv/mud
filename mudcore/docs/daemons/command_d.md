### CORE_COMMAND_D

`COMMAND_D` 指令守护进程，处理玩家指令相关的功能。

### 核心方法

```c
// 处理别名，由 `process_input()` 调用
string default_alias(string verb);
// 获取游戏别名列表
mapping query_default_alias();
// 重新设置别名列表
void set_alias(mapping aliases);
// 新增别名列表
void add_alias(mapping aliases);
// 寻找指令并返回指令文件对象
object find_command(string verb);
```

如果需要新增别名，开发者定义 `COMMAND_D` 并继承 `CORE_COMMAND_D`，重写 `default_alias` 和 `add_alias` 方法即可。
