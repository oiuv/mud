// Room: /lingzhou/caodi1.c
// Java. Sep 21 1998

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "衙门");
	set("long", @LONG
这是灵州府衙所在地，黑色大门平时紧紧闭着，门前四个身着皂服
的衙役没精打采的拄着水火棍站着。边上有个大鼓。
LONG );
	set("exits", ([
		"south" : __DIR__"dongdajie",
	]));
	set("objects", ([
		"/d/city/npc/yayi" : 4,
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}

