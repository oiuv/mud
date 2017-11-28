inherit ROOM;
#include <ansi.h>

void create()
{
	set("short","海澄公府大厅");
	set("long", @LONG
这是海澄公府的大厅，大厅不大，装饰也不华丽，很难想象这里竟然是一
等公爵的居所。此时大厅内外一片嘈杂，挤满了上门来寻事的御前侍卫。
LONG );
	set("exits", ([
		"north" : __DIR__"hai_dayuan",
		"south" : __DIR__"hai_houyuan",
	]));
	set("objects", ([
		__DIR__"npc/duolong" : 1,
		__DIR__"npc/zheng" : 1,
		__DIR__"npc/feng" : 1,
	]));

	setup();
        replace_program(ROOM);
}
