### CORE_EMOTE_D

表情功能守护进程，实现游戏表情功能，表情存档文件为 `/data/emote_d.o`

### 核心方法

```c
varargs int do_emote(object me, string verb, string target, object *obs, string channel);

```

> 参数说明

    me          发送动作的对象
    verb        表情动词，如 `hi`
    target      动作目标，如 玩家名称
    obs         广播对象
    channel     动作频道

```c
// 设置表情
int set_emote(string pattern, string *def);

// 删除表情
int delete_emote(string pattern);

// 查询表情
string *query_emote(string pattern)

// 获取所有表情
string *query_all_emote()
```

如果不需要框架提供的守护进程，可以自己定以 `EMOTE_D` 覆盖， `EMOTE_D` 必须实现 `do_emote` 方法。
