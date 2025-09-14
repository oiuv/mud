## 游戏环境的开发

### 关于环境

游戏中任何对象都可以做为其它对象的环境，哪怕是一个没有任何代码的空文件，只要载入游戏，都可以做为其它对象的环境，只是这样的环境没有什么意义，我们新进一个空文件试试。

在`/u/mudren/test/`目录下新建文件`room.c`，没有任何代码，然后我们输入指令`goto /u/mudren/test/room.c`,嗯？传送失败！`goto`指令的核心是调用玩家对象的`move`方法把玩家移动到目标环境，玩家移动时的本质也是一样的，这个指令在玩家对象继承的`F_MOVE`接口中，我们看这个文件代码可知道，在炎黄中有重量的概念，当环境的承载重量低于物品的重量时移动失败。环境负重是调用`query_max_encumbrance()`这个方法，我们在`/u/mudren/test/room.c`中写入以下代码：

```c
int query_max_encumbrance()
{
    return 100000000000;
}
```

先`update /u/mudren/test/room`更新代码，然后再次`goto /u/mudren/test/room`，成功进入新的环境啦~~~

只不过这个环境什么都没有，显示出来很奇怪的样子：

    0 - /u/mudren/test/room
        0

其实标准的游戏环境就是我们给环境对象规范了一系列的变量和方法，然后通过标准方式显示给玩家。

游戏中是通过对象继承的`F_MOVE`接口中的`move`方法把对象移进环境，并在移动后自动调用`look`指令中的`look_room`函数，把目前环境描述给玩家，我们看看`/cmds/std/look`代码可知，在`look_room`中调用环境对象`env`的`short()`、`long()`和`query("exits")`方法获取环境的名称、描述和出口。我们改造一下代码，增加如下内容：

```c
inherit F_DBASE;

void create()
{
    set("short", "测试环境");
    set("long", "这是一个最基础的测试环境，这里什么也没有，在这里有一个向下的出口，通向扬州城客店。");
    set("exits",([
        "down":"/d/city/kedian"
    ]));
}

string short()
{
    return query("short");
}

string long()
{
    return query("long");
}
```

这里自己实现了环境描述和出口，因为`set`和`query`是`/feature/dbase.c`中实现的方法，我们需要`inherit F_DBASE`来使用。

更新环境代码（可以直接`update here`），我们看到熟悉的环境描述了：

    测试环境 - /u/mudren/test/room
        这是一个最基础的测试环境，这里什么也没有，在这里有一个向下的出口，通向扬州城客店。
        这里唯一的出口是 down。

我们输入`d`向下移动试试，嗯？你过不去！看看`/cmds/std/go`的移动控制指令，可以发现，在移动时会调用当前环境的`valid_leave(me, arg)`检查是否允许移动到目标方向。我们再在环境代码中增加如下内容：

```c
int valid_leave(object me, string arg)
{
    return 1;
}
```

更新环境后，移动试试，成功！这个看起来有作用的环境最终代码如下：

```c
inherit F_DBASE;

void create()
{
    set("short", "测试环境");
    set("long", "这是一个最基础的测试环境，这里什么也没有，在这里有一个向下的出口，通向扬州城客店。");
    set("exits",([
        "down":"/d/city/kedian"
    ]));
}

string short()
{
    return query("short");
}

string long()
{
    return query("long");
}

int query_max_encumbrance()
{
    return 100000000000;
}

int valid_leave(object me, string arg)
{
    return 1;
}
```

以上从零开始的代码只是让大家对环境有一个认知：**游戏环境并没有什么要求和规范，一切都是我们自己根据需要实现的**，标准是我们自己定的，每个类型的MUD都是不同的，并不是所有MUD的都是用short和long来描述环境，以上代码如果我们修改`look`指令中读取环境相关的方法，比如，把名称用`name`，描述用`description`，然后同步在环境中实现相关代码，也能正常使用。

---
### 继承标准环境

在正式游戏开发中，我们是把环境的标准接口封装在一个对象中，直接继承使用。在炎黄MUD中把环境需要的相关接口都封装在一个标准继承文件`/inherit/room/room.c`中，我们在开发环境时，不需要自己实现基本功能，只用继承这个文件即可。比如以上我们自己实现的环境，通过继承标准房间`inherit ROOM;`，只用以下代码：

```c
inherit ROOM;

void create()
{
    set("short", "测试环境");
    set("long", "这是一个最基础的测试环境，这里什么也没有，在这里有一个向下的出口，通向扬州城客店。");
    set("exits",([
        "down":"/d/city/kedian"
    ]));
}
```

#### 环境对象

在标准环境对象`ROOM`接口中，有一个非常重要的apply方法`reset()`，这个方法是驱动不定期自动调用的，用来重置环境的状态。游戏在这个方法中实现了环境对象的自动加载，核心代码是取得环境中`objects`中的对象列表(`query("objects")`)并加载到环境中，具体代码大家直接看游戏源码。

我们来试试，代码如下：

```c
inherit ROOM;

void create()
{
    set("short", "测试环境");
    set("long", "这是一个最基础的测试环境，这里有几个练功用的假人，向下有一个出口，通向扬州城客店。");
    set("exits",([
        "down":"/d/city/kedian"
    ]));
    set("objects", ([
        "/clone/npc/mu-ren" : 1,
        "/clone/npc/tie-ren" : 2,
        "/clone/npc/tong-ren" : 3,
    ]));
}
```

更新后，游戏环境中并没有增加什么，这是因为`reset()`方法是驱动定期调用的（大概每15分钟左右），我们要立即生效需要自己调用一次，在`set("objects",([]))`后面增加`reset();`试试：

```c
inherit ROOM;

void create()
{
    set("short", "测试环境");
    set("long", "这是一个最基础的测试环境，这里有几个练功用的假人，向下有一个出口，通向扬州城客店。");
    set("exits",([
        "down":"/d/city/kedian"
    ]));
    set("objects", ([
        "/clone/npc/mu-ren" : 1,
        "/clone/npc/tie-ren" : 2,
        "/clone/npc/tong-ren" : 3,
    ]));
    reset();
}
```

再次更新代码(`update here`)，游戏显示如下：

    > update here
    重新编译 /u/mudren/test/room.c：成功！
    > l
    测试环境 - /u/mudren/test/room
        这是一个最基础的测试环境，这里有几个练功用的假人，向下有一个出口，通向扬州城客店。
        这里唯一的出口是 down。
    木人(mu ren)
    二位铁人(tie ren)
    三位铜人(tong ren)
    >

环境中的对象都显示出来啦。

我们在开发中并不是调用`reset()`，而是调用`setup()`，其实`setup()`的核心代码就是调用`reset()`，只是再增加了其它初始化的内容，具体可以查看游戏源文件。

#### 门

在`ROOM`中还有门等功能的实现，要在某个方向增加一扇门，只用使用`create_door`方法行就了。我们修改一下环境代码，如下示例：

```c
// room.c
#include <room.h>
inherit ROOM;

void create()
{
    set("short", "测试环境");
    set("long", "这是一个最基础的测试环境，这里有几个练功用的假人，向西有一扇铁门，向下有一个出口，通向扬州城客店。");
    set("exits",([
        "down":"/d/city/kedian",
        "west":__DIR__"room2",
    ]));
    set("objects", ([
        "/clone/npc/mu-ren" : 1,
        "/clone/npc/tie-ren" : 2,
        "/clone/npc/tong-ren" : 3,
    ]));
    create_door("west", "铁门", "east", DOOR_CLOSED);

    setup();
}
```

门是要房间两边都要设置的，我们再新建一个房间`room2.c`，代码如下：

```c
// room2.c
#include <room.h>
inherit ROOM;

void create()
{
    set("short", "测试环境2");
    set("long", "这是一个最基础的测试环境，这里有几个练功用的假人。");
    set("exits",([
        "east":__DIR__"room"
    ]));
    set("objects", ([
        "/clone/npc/mu-ren" : 1,
        "/clone/npc/tie-ren" : 2,
        "/clone/npc/tong-ren" : 3,
    ]));
    create_door("east", "铁门", "west", DOOR_CLOSED);

    setup();
}
```

注意这里`#include <room.h>`，因为用了关于门开关状态的宏定义`DOOR_CLOSED`，统一放在头文件中由所有需要的环境引用。

更新环境测试一下`open door`和`close door`，看看有什么不同。

#### 移动限制

在游戏中我们有可能需要对玩家做一些移动条件的限制，比如骑马不能进入，轻功不足多少级不能进入。在最开始的环境基础演示中我们定义了一个`valid_leave`方法并返回1，这个接口就是这个用途。在需要做限制的房间中我们只用重写这个方法就可以了，演示看看，我们在`room2.c`中增加`valid_leave`限制代码，如下：

```c
// room2.c
#include <room.h>
inherit ROOM;

void create()
{
    set("short", "测试环境2");
    set("long", "这是一个最基础的测试环境，这里有几个练功用的假人。");
    set("exits",([
        "east":__DIR__"room"
    ]));
    set("objects", ([
        "/clone/npc/mu-ren" : 1,
        "/clone/npc/tie-ren" : 2,
        "/clone/npc/tong-ren" : 3,
    ]));
    create_door("east", "铁门", "west", DOOR_CLOSED);

    setup();
}

int valid_leave(object me, string dir)
{
    if (objectp(present("mu ren", environment(me))) && dir == "east")
        return notify_fail("木人把你拦了下来。\n");
    return ::valid_leave(me, dir);
}
```

现在向东移动会被木人拦住，干掉木人(如：smash mu ren)后才能正常过去。

现在对游戏环境开发的内容清楚明白了吗？

除了以上最基础的环境外，我们还经常在环境中增加一些参数来扩展功能，主要有如下：

```c
    set("valid_startroom", 1); // 允许做为存档点，玩家使用`save`指令时会调用判断
    set("no_fight", 1); // 禁止战斗，玩家使用`fight`或`kill`等战斗指令时会调用判断
    set("sleep_room", 1); // 允许睡觉，玩家使用`sleep`指令时会调用判断
    set("no_steal", 1); // 禁止偷盗，玩家使用`steal`指令时会调用判断
    set("item_desc",(["提示":"描述"])); // 增加环境提示描述，可以直接look 提示
```

我们还可以根据自己的需要增加更多的参数，只要自己统一好标准就好。
