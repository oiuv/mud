#include <room.h>
inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
你走在一条尘土飞扬的大官道上。不时有两三骑快马从身边飞驰而过，扬
起一路尘埃。道路两旁是整整齐齐的杨树林。
LONG );
       set("exits", ([
		"east" : __DIR__"shi_2",
		"north" : __DIR__"guandao_2",
	]));
	set("objects", ([
		__DIR__"npc/tangzi" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

