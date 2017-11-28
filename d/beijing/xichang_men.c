inherit ROOM;
#include <ansi.h>

void create()
{
	set("short", "西厂大门");
	set("long", @LONG
这里就是京城的特务机构——西厂的大门。这里警备深严，不时有穿着制
服的西厂官兵进进出出，望大门里望去，可以望见大门里面有许多太监。大门
两旁的西厂官兵正如狼似虎的盯着你看，如果你不想找死的话，最好还是赶快
离开的好。
LONG NOR);
	set("exits", ([
		"south" : __DIR__"xichang",
		"north" : __DIR__"di_2",
	]));
	set("objects", ([
		__DIR__"npc/bing3" : 2,
	]));
	setup();
        replace_program(ROOM);
}

