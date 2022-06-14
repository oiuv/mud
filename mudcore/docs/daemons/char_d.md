### CORE_CHAR_D

`CHAR_D`角色数据处理守护进程，常用来初始化玩家对象和NPC对象。

### 核心方法

```c
// 新玩家初始化，LOGIN_D 自动调用
void init_player(object user);
// 角色更新检查
void update(object ob);
// 角色设置
void setup(object ob);
```

以上方法都需要开发者实现具体功能并调用，`init_player()` 方法在 `LOGIN_D` 守护进程中新玩家注册自动调用， `setup()` 方法推荐在 USER_OB 的 `setup()` 方法中调用。
