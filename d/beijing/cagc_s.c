#include <room.h>
inherit ROOM;

void create()
{
	set("short", "长安广场");
	set("long", @LONG
这里便是长安街广场了，长安街广场北京城里最热闹、最杂乱的地段。南
方的一座天桥横跨东西，正是卖杂货、变把戏、跑江湖的闲杂人等聚居的所在。
宽阔的大道向南北两头延伸。从南方经过宏伟的凡陛桥就是北京城里的最有名
的名胜——天坛了，过天坛再向南方迈进就是永定门，通往郊外。在这里可以
看见北方不远处的一堵堵高大的城墙，那里便是天安门广场了。
LONG );
       set("exits", ([
		"south" : __DIR__"tianqiao",
		"north" : __DIR__"tiananmen",
	]));
	set("objects", ([
		__DIR__"npc/maiyi1" : 1,
		__DIR__"npc/xianren" : 2,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

