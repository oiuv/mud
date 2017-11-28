// Room: /d/mingjiao/midao0.c
// Date: Java 97/04/9

inherit ROOM;
#include <room.h>;
void create()
{
	set("short", "甬道");
	set("long", @LONG
这是一条小小的甬道，周围都是石壁，极为坚硬，看来不是什么
武功能打破的。向外的石门早已悄然合上，你只有鼓勇向前。
LONG );
	set("exits", ([
		"north" : __DIR__"midao1",
	]));
	set("no_clean_up", 0);
	setup();
        create_door("north", "石门", "south", !DOOR_CLOSED);
	replace_program(ROOM);
}
