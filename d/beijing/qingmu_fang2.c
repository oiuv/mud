#include <room.h>
inherit ROOM;

void create()
{
        set("short", "青木堂");
        set("long", @LONG
这里是一间看似很普通的民居，不过却要比通常的民居大了数倍。房间正
中一张长桌，天地会的青木堂的群豪围桌而坐，大声喧谈。
LONG );
       set("exits", ([
                "north" : __DIR__"qingmu_dayuan",
        ]));
        set("objects", ([
                 __DIR__"npc/guananji" : 1,
                 __DIR__"npc/qianlaoben" : 1,
                 __DIR__"npc/jialaoliu" : 1,
        ]));
        set("outdoors", "beijing");
        setup();
        replace_program(ROOM);
}

