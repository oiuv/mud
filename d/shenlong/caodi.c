#include <ansi.h>

inherit ROOM;

void create()
{
    set("short", "草地");
    set("long", @LONG
这里是一片青青的草地，有几个少年在玩耍。四周开满了各色的
鲜花，一阵凉风吹过，清新的空气中传来几缕淡淡的花香。
LONG );

	set("exits", ([
		"south" : __DIR__"kongdi",
		"north" : __DIR__"xiaowu",
	]));
	set("outdoors", "shenlong");
	setup();
	replace_program(ROOM);
}

