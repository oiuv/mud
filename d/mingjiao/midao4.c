// Room: /d/mingjiao/midao4.c
// Date: Java 97/04/9

inherit ROOM;
#include <room.h>;
void create()
{
	set("short", "石室");
	set("long", @LONG
这是一条小小的甬道，周围都是石壁，极为坚硬，看来不是什么
武功能打破的。石室里伸手不见无指，顺着石壁你摸索着好象周围有
石门。
LONG );
	set("exits", ([
		"south" : __DIR__"midao12",
		"north" : __DIR__"midao8",
		"east"  : __DIR__"midao1",
		"west"  : __DIR__"midao3",
	]));
	set("no_clean_up", 0);
	set("no_drop", 1);
	setup();
        create_door("south", "石门", "north", DOOR_CLOSED);
        create_door("north", "石门", "south", DOOR_CLOSED);
        create_door("east",  "石门", "west",  DOOR_CLOSED);
        create_door("west",  "石门", "east",  DOOR_CLOSED);
	replace_program(ROOM);
}
