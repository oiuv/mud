#include <room.h>
inherit ROOM;

void create()
{
	set("short", "西长安街");
	set("long", @LONG
热闹的西长安大街是紫禁城的交通要道，宽阔的青石大道向东西两头延伸，
街道上行人不断，繁华的盛世景象不言而喻。在这里可以远远望见东边那一堵
堵高大厚实的古城墙，便是著名的天安门广场了。从这里转北就是西单了，那
也是京城里的繁华地段。南边茶铺里不时传来一阵阵喧杂的吵闹声。
LONG );
       set("exits", ([
		"west" : __DIR__"caroad_w1",
		"east" : __DIR__"cagc_w",
		"north" : __DIR__"xi_2",
		"south" : __DIR__"gaosheng",
	]));
	set("objects", ([
		__DIR__"npc/boy2" : 1,
		__DIR__"npc/richman1" : 1,
		__DIR__"npc/shusheng1" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

