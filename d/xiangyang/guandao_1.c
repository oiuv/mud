#include <room.h>
inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
你走在一条尘土飞扬的大官道上。不时有两三骑快马从身
边飞驰而过，扬起一路尘埃。道路两旁是整整齐齐的杨树林。
LONG );
       set("exits", ([
		"east" : __DIR__"westgate2",
		"north" : __DIR__"guandao_2",
	]));
	set("outdoors", "xiangyang");
	setup();
	replace_program(ROOM);
}

