#include <room.h>
inherit ROOM;

void create()
{
	set("short", "杨柳胡同");
	set("long", @LONG
这里是杨柳胡同的深处。走到这里，光线越发的暗淡起来，狭窄的通道还
在不断的向南边延伸。
LONG );
       set("exits", ([
		"north" : __DIR__"yangliu1",
		"south" : __DIR__"yangliu3",
	]));

	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

