// kslu.c

#include <room.h>

inherit ROOM;

void create()
{
        set("short", "碎石路");
        set("long", @LONG
这是一条碎石子铺就的路，路上人来人往，赶着大车，看来是在
运什么东西。地上零零散散的遗落了一些蓝色的石头。往东就是江南
盛产铜矿的宝山了。
LONG);
        set("exits", ([
                "west" : __DIR__"road17",
                "east" : __DIR__"kslu2",
        ]));
        set("outdoors", "hangzhou");
        setup();
        replace_program(ROOM);
}
