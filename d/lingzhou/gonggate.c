// Room: /lingzhou/gonggate.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "皇宫大门");
	set("long", @LONG
这里就是西夏皇宫正门，四扇宽阔的朱红大门，上面包着拳头大的
铜钉。门的两边站着两排衣甲鲜明的武士，戒备深严。
LONG );
	set("exits", ([
		"north"  : __DIR__"gongsquare",
		"south"  : __DIR__"beidajie",
	]));
	set("no_fight",1);
	set("objects", ([
		__DIR__"npc/gongweishi" : 2,
	]));
	setup();
        create_door("north" , "红漆宫门", "south" , DOOR_CLOSED);
}

int valid_leave(object me, string dir)
{
        if (dir == "north" && 
            objectp(present("wei shi", environment(me))))
           return notify_fail("卫士对你大吼一声：放肆！那不是你能进去的地方。\n");

        return ::valid_leave(me, dir);
}

