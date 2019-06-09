#include <ansi.h>

inherit ROOM;

varargs void create(int x, int y, int z)
{
    set("short", "无限迷宫");
    set("long", "这里是无限迷宫，你根本不知道该向哪儿走。\n");
    set("exits", ([
        "north":__DIR__ "maze/" + x + "," + (y + 1) + "," + z,
        "south":__DIR__ "maze/" + x + "," + (y - 1) + "," + z,
        "west":__DIR__ "maze/" + (x - 1) + "," + y + "," + z,
        "east":__DIR__ "maze/" + (x + 1) + "," + y + "," + z,
    ]));
    set("maze", "maze");
    set("outdoors", "maze");

    if (!random(100))
    {
        set("long", "这里是无限迷宫，你已经不知道自己的方向了，这里有一块指示牌(board)。\n");
        set("item_desc", ([
            "board":"迷宫出口提示：" HIY "杀掉BOSS" NOR "！\n",
        ]));
    }

    if (!random(10))
    {
        set("objects", ([
            "/clone/beast/qingshe":1,
        ]));
    }

    if (!random(20))
    {
        set("objects", ([
            "/clone/beast/wubushe":1,
        ]));
    }

    if (!random(30))
    {
        set("objects", ([
            "/clone/beast/yanjingshe":1,
        ]));
    }

    setup();
}
