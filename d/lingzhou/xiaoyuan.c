// Room: /lingzhou/xiaoyuan.c
// By Doing

#include <room.h>

inherit ROOM;
void create()
{
	set("short", "将军府小院");
	set("long", @LONG
这里是将军府的小院，一色的青砖铺地，有几个仆役正在院中洒
扫，远远的传来一阵嬉笑声。
LONG );

	set("exits", ([
		"west" : __DIR__"jiangjunyuan",
	]));

	setup();
        replace_program(ROOM);
}
