#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青木堂");
        set("long", @LONG
这里是一间看似很普通的民居，不过却要比通常的民居大了数倍。房间中
座着一个干瘦老头。房间的南边又是一道门。
LONG );
       set("exits", ([
                "south" : __DIR__"qingmu_dating",
                "west" : __DIR__"qingmu_dayuan",
        ]));
        set("objects", ([
                __DIR__"npc/xutianchuan" : 1
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

