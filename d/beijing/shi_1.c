#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西四南大街");
	set("long", @LONG
这里是京城的西四南大街，青石铺砌道路贯通南北，著名的砖塔儿胡同也
在这条大街上。街道上的行人熙熙攘攘。南方接京城的西单北大街，北方是西
四北大街。
LONG );
       set("exits", ([
		"north" : __DIR__"shi_2",
		"south" : __DIR__"bei_3",
	]));
	set("objects", ([
		__DIR__"npc/liumang" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

