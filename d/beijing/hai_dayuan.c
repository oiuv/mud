inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","海澄公府大院");
	set("long", @LONG
这是进门后的一个不大的花园。西面是一个厢房，东面是一扇月形门通往
海澄公府的花厅，北面是海澄公府的大门，南面就是大厅了。
LONG );
	set("exits", ([
		"north" : __DIR__"hai_men",
		"south" : __DIR__"hai_dating",
		"east" : __DIR__"hai_huating",
		"west" : __DIR__"hai_fang",
	]));
	set("objects", ([
		__DIR__"npc/yuqian1" : 1,
		__DIR__"npc/yuqian2" : 1,
	]));

	setup();
        replace_program(ROOM);
}
