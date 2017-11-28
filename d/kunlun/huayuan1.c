#include <ansi.h>
#include <room.h>

inherit ROOM;

void create()
{
	set("short", "花园");
        set("long", @long
这是一条铺的十分平整的石板路，路面被打扫的干干净净
南面过去是个花圆，传来阵阵花香，西面是静修室，东面传来
些读书声，看来那里是书房了。
long);
        set("exits",([
		"north" : __DIR__"shilu1",
		"south" : __DIR__"lang2",
	]));

	set("outdoors", "kunlun");
	setup();
	replace_program(ROOM);
}
