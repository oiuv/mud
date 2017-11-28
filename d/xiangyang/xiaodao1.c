#include <room.h>
inherit ROOM;

void create()
{
	set("short", "大官道");
	set("long", @LONG
这是一条弯弯曲曲的小道，前放不远出是一片树林，不知
道通向何处。
LONG );
       set("exits", ([
		"north" : __DIR__"shulin",
		"south" : __DIR__"guandao_2",
	]));
	set("outdoors", "xiangyang");
	setup();
	replace_program(ROOM);
}