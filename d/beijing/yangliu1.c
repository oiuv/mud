#include <room.h>
inherit ROOM;

void create()
{
	set("short", "杨柳胡同");
	set("long", @LONG
这里是杨柳胡同的胡同口，深深的巷道朝着南边曲折的延伸下去，旁晚时
分，胡同口不远的西边炊烟渺渺，似是居住着几户人家。只见北方尘土飞扬，
马蹄声和吆喝声相互穿插，那里便是贯穿京城的长安大街。
LONG );
       set("exits", ([
		"north" : __DIR__"caroad_w1",
		"south" : __DIR__"yangliu2",
		"west" : __DIR__"minju_y",
	]));
	set("objects", ([
		__DIR__"npc/old1" : 1,
	]));
	set("outdoors", "beijing");
	setup();
	replace_program(ROOM);
}

