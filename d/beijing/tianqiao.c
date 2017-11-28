#include <room.h>
inherit ROOM;

void create()
{
	set("short", "凡陛桥");
	set("long", @LONG
凡陛桥是一座桥横跨东西的天桥，桥上面人声鼎沸，正是卖杂货、变把戏、
跑江湖的闲杂人等聚居的所在。宽阔的大道向南北两头延伸。向南方对直迈进
可以到达北京城里的名胜天坛。北方是一块宽阔的空地，那里便是热闹的长安
街广场了。凡陛桥的东西两个方向分别连接了京城的永内东街和虎坊路。
LONG );
	set("exits", ([
		"south" : __DIR__"tiantan_n",
		"north" : __DIR__"cagc_s",
		"east" : __DIR__"yong_1",
		"west" : __DIR__"fu_2",
	]));
	set("objects", ([
		__DIR__"npc/maiyi2" : 1,
		__DIR__"npc/xianren" : 2,
		__DIR__"npc/xiaofan" : 1,
		__DIR__"npc/old1" : 1,
		__DIR__"npc/boy2" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

