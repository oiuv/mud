// Room: /lingzhou/biangate.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "边门");
	set("long", @LONG
这里是皇宫的边门，供侍卫和内侍们出入之用，宫里所需的东西一
般都由此运入，因为比较偏僻，守卫的卫士也不多。
LONG );
	set("exits", ([
		"west"  : __DIR__"caifang",
		"east"  : __DIR__"xiaolu3",
	]));
	set("no_fight",1);
	set("objects", ([
		__DIR__"npc/gongweishi" : 2,
	]));
	setup();
        create_door("west" , "红漆宫门", "east" , DOOR_CLOSED);
}

int valid_leave(object me, string dir)
{
        if (dir == "west" && 
            objectp(present("wei shi", environment(me))))
           return notify_fail("卫士对你大吼一声：放肆！那不是你能进去的地方。\n");

        return ::valid_leave(me, dir);
}

