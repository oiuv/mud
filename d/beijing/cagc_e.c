#include <room.h>
inherit ROOM;

void create()
{
	set("short", "长安广场");
	set("long", @LONG
这里是天安门右边的东长安街广场，宽阔的长安大街向东西两头延伸，这
里京城里最热闹繁华的地段，既是交通要道，也是京城百姓们的聚点, 广场上
车水马龙，热闹非凡。小贩们沿街叫卖着自己的货物。一些游手好闲的人常常
在这里溜溜达达。这里可以望见西边高大厚实的古城墙，那里便是天安门广场
了。东边则是东长安大街。
LONG );
       set("exits", ([
		"east" : __DIR__"caroad_e1",
		"west" : __DIR__"tiananmen",
	]));
	set("objects", ([
		__DIR__"npc/shusheng1" : 2,
		__DIR__"npc/xianren" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

