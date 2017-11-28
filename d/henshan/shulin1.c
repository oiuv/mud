#include <ansi.h>
inherit ROOM;

void create()
{
	set("short","树林");
	set("long",@LONG
这里是衡山半山腰的一片树林，据说这里经常有野兽出没。
LONG);

	set("objects",([
			__DIR__"npc/hunter" : 1,
	]));

	set("exits", ([
		"east"  :  __DIR__"shanlu6",
	]));

	set("quarrys", ([
			"tu"        : 100000,
			"ji"        : 80000,
			"jizi"      : 50000,
			"dushe"     : 20000,
			"hu"        : 5000,
	]));
	set("outdoors","henshan");
	setup();
	replace_program(ROOM);
}
