#include <room.h>
inherit ROOM;

void create()
{
        set("short", "独木桥");
        set("long", @LONG
这里是一座独木桥，也不知是什么时候架起来的，走在上
面摇摇晃晃的，很是危险。如果你要过河的话，就只有走这里。
从桥上望下去，只见急流勇潺，一掉下去，肯定没命。
LONG);
        set("outdoors", "kunming");

        set("exits", ([
                "south" : __DIR__"qiao2", 
                "north"  :__DIR__"road5",
        ]));
        setup();
        replace_program(ROOM);
}