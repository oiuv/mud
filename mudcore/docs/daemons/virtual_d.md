### 虚拟对象守护进程

需要项目定义 `WORLD_DIR` 和 `MOB_DIR`，由 `MASTER_OB` 自动处理。

### 核心方法

```c
mixed compile_area(string file);
mixed compile_mob(string file);
mixed compile_object(string file);
```

### 虚拟对象功能说明

#### 地区对象

需在 `WORLD_DIR` 中，有二种虚拟地形方式：

1. 虚拟对象文件为`实际对象文件/x,y,z`或`实际对象文件/x,y`，常用于无限随机地形。

以实际对象文件 `wild.c` 为列，实际对象文件需要实现以下方法:

```c
varargs void create(int x, int y, int z)
{
    set("exits", ([
        "north" : __DIR__ "wild/" + x + "," + (y + 1) + "," + z,
        "south" : __DIR__ "wild/" + x + "," + (y - 1) + "," + z,
        "west" : __DIR__ "wild/" + (x - 1) + "," + y + "," + z,
        "east" : __DIR__ "wild/" + (x + 1) + "," + y + "," + z,
    ]));
    // 房间其他设置
    // ...
}
```

2. 虚拟对象文件为 `实际对象文件/x-y`，常用于迷宫地形。

示例代码如下：

```c
// 迷宫
#include <ansi.h>
inherit CORE_VRM;

void create()
{
    //迷宫房间所继承的对象的档案名称。
    set_inherit_room( ROOM );

    //迷宫房间里的怪物。
    set_maze_npcs(({MOB_DIR "9/11", MOB_DIR "9/28", MOB_DIR "9/38", MOB_DIR "9/44", MOB_DIR "9/55"}));

    //迷宫的单边长
    set_maze_long(10);

    //入口方向(出口在对面)
    set_entry_dir("south");

    //入口与区域的连接方向
    set_link_entry_dir("south");

    //入口与区域的连接档案名
    set_link_entry_room(__DIR__"start_room");

    //出口与区域的连接方向
    set_link_exit_dir("north");

    //出口与区域的连接档案名
    set_link_exit_room(__DIR__"tower");

    //入口房间短描述
    set_entry_short(HIB "黑森林" NOR);

    //入口房间描述
    set_entry_desc(HIB @LONG
这里据说就是黑森林，里面全是阴雾，阴气逼人，不小心就可能迷失方向了。
LONG NOR);

    //出口房间短描述
    set_exit_short(HIB "黑森林" NOR);

    //出口房间描述
    set_exit_desc(HIB @LONG
你眼前一亮，深深的吸了口气，心想总算是出来了。不过景色忽的一变，眼前出现一座高耸入云的魔法塔。
LONG NOR);

    //迷宫房间的短描述
    set_maze_room_short(HIB "黑森林" NOR);

    //迷宫房间的描述，如果有多条描述，制造每个房间的时候会从中随机选择一个。
    set_maze_room_desc(HIB @LONG
四周越来越暗了，你胆颤心惊的向前摸索着，到处是一些迷路人的尸体和骷髅。不时传来一阵阵鬼哭儿狼嚎,好象有什么东西在暗中窥视着，你不由的加快了脚步。
LONG NOR);

    // 迷宫房间是否为户外房间？
    set_outdoors(1);
}
```

#### 魔物对象

需要在 `MOB_DIR` 中，虚拟对象文件为 `实际对象/n`，`n` 为怪物唯一ID，需要自己实现相应功能。

#### 其他对象

需要开发者自己根据游戏开发需要实现。
