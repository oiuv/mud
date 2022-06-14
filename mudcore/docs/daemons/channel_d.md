### CORE_CHANNEL_D

聊天频道守护进程，默认包括系统(sys)、公告(msg)、闲聊(chat)、交易(bill)、广播(shout)五个频道。

系统和公告频道限制为系统和管理员可用。交易频道要求玩家等级超过20级可用，广播频道每次使用需要消耗100钱币(coin)。

### 核心方法

```c
int do_channel(object me, string verb, string arg);
```

> 参数说明

    me      发送消息的对象
    verb    频道动作，如：chat 或 chat*
    arg     消息内容或表情名称，如 `hi`

如果不需要框架提供的守护进程，可以自己定以 `CHANNEL_D` 覆盖， `CHANNEL_D` 必须实现 `do_channel` 方法。
