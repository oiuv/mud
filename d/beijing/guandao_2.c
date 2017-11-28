#include <room.h>
inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
你走在一条尘土飞扬的大官道上。不时有两三骑快马从身边飞驰而过，扬
起一路尘埃。道路两旁是整整齐齐的杨树林。北方不远处就是京城著名的名胜
十三皇陵。
LONG );
       set("exits", ([
		"north" : __DIR__"huangling",
		"south" : __DIR__"guandao_1",
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

