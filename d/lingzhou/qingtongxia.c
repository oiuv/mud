// Room: /lingzhou/qingtongxia.c
// Java Sep.23 1998

#include <room.h>

inherit ROOM;

void create()
{
	set("short", "青铜峡");
	set("long", @LONG
这里是黄河河西走廊段中最遄急的青铜峡，黄河一路流淌到这里，
宽阔的河面一下子变窄，两岸的峭壁象一对生死恋人紧紧不愿分开，
黄河却象不懂事的孩子从中硬挤而过，结果水流一下子变得咆哮起来，
波浪滔天，水声隆隆。
LONG	);
	set("exits", ([
		"northeast" : __DIR__"xiaoba",
		"southwest" : __DIR__"mingshazhou",
	]));
	set("no_clean_up", 0);
	set("outdoors", "lingzhou");
	setup();
	replace_program(ROOM);
}


